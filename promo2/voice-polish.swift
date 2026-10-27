// "Advert" voice polish using macOS built-in audio units (offline): high-pass, presence EQ, compressor, light room, normalise.
// Usage: voice-polish in.wav out.aiff
import AVFoundation
let inURL = URL(fileURLWithPath: CommandLine.arguments[1]), outURL = URL(fileURLWithPath: CommandLine.arguments[2])
let file = try! AVAudioFile(forReading: inURL)
let fmt = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
// resample to 44.1 kHz first
let conv = AVAudioConverter(from: file.processingFormat, to: fmt)!
let inBuf = AVAudioPCMBuffer(pcmFormat: file.processingFormat, frameCapacity: AVAudioFrameCount(file.length))!; try! file.read(into: inBuf)
let tail: AVAudioFrameCount = 44100 / 2
let rs = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: AVAudioFrameCount(Double(file.length) * 44100 / file.processingFormat.sampleRate) + 4096 + tail)!
var fed = false
_ = conv.convert(to: rs, error: nil) { _, st in if fed { st.pointee = .endOfStream; return nil }; fed = true; st.pointee = .haveData; return inBuf }
rs.frameLength = rs.frameLength + 0 // keep
// engine chain
let engine = AVAudioEngine(); let player = AVAudioPlayerNode()
let eq = AVAudioUnitEQ(numberOfBands: 4)
let b = eq.bands
b[0].filterType = .highPass; b[0].frequency = 90; b[0].bypass = false
b[1].filterType = .parametric; b[1].frequency = 220; b[1].bandwidth = 1.0; b[1].gain = -2.0; b[1].bypass = false      // less boxy
b[2].filterType = .parametric; b[2].frequency = 3200; b[2].bandwidth = 1.2; b[2].gain = 3.0; b[2].bypass = false      // presence
b[3].filterType = .highShelf; b[3].frequency = 9000; b[3].gain = 2.0; b[3].bypass = false                           // air
let comp = AVAudioUnitEffect(audioComponentDescription: AudioComponentDescription(componentType: kAudioUnitType_Effect, componentSubType: kAudioUnitSubType_DynamicsProcessor, componentManufacturer: kAudioUnitManufacturer_Apple, componentFlags: 0, componentFlagsMask: 0))
let reverb = AVAudioUnitReverb(); reverb.loadFactoryPreset(.smallRoom); reverb.wetDryMix = 7
[player, eq, comp, reverb].forEach { engine.attach($0) }
engine.connect(player, to: eq, format: fmt); engine.connect(eq, to: comp, format: fmt); engine.connect(comp, to: reverb, format: fmt); engine.connect(reverb, to: engine.mainMixerNode, format: fmt)
// compressor settings: threshold -22 dB, headroom 6 dB, fast attack, makeup gain
let au = comp.audioUnit
AudioUnitSetParameter(au, kDynamicsProcessorParam_Threshold, kAudioUnitScope_Global, 0, -22, 0)
AudioUnitSetParameter(au, kDynamicsProcessorParam_HeadRoom, kAudioUnitScope_Global, 0, 6, 0)
AudioUnitSetParameter(au, kDynamicsProcessorParam_AttackTime, kAudioUnitScope_Global, 0, 0.004, 0)
AudioUnitSetParameter(au, kDynamicsProcessorParam_ReleaseTime, kAudioUnitScope_Global, 0, 0.12, 0)
AudioUnitSetParameter(au, kDynamicsProcessorParam_OverallGain, kAudioUnitScope_Global, 0, 6, 0)
try! engine.enableManualRenderingMode(.offline, format: fmt, maximumFrameCount: 4096)
try! engine.start(); player.scheduleBuffer(rs, at: nil); player.play()
let outBuf = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: rs.frameLength + tail)!
let chunk = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat, frameCapacity: 4096)!
while outBuf.frameLength < rs.frameLength + tail {
  let n = min(4096, rs.frameLength + tail - outBuf.frameLength)
  _ = try! engine.renderOffline(n, to: chunk)
  for ch in 0..<2 { memcpy(outBuf.floatChannelData![ch].advanced(by: Int(outBuf.frameLength)), chunk.floatChannelData![ch], Int(chunk.frameLength) * 4) }
  outBuf.frameLength += chunk.frameLength
}
engine.stop()
// trim trailing near-silence beyond 0.25 s, normalise peak to -1 dBFS
let d = outBuf.floatChannelData![0], d2 = outBuf.floatChannelData![1]; var peak: Float = 0; var last = 0
for i in 0..<Int(outBuf.frameLength) { let v = max(abs(d[i]), abs(d2[i])); if v > peak { peak = v }; if v > 0.003 { last = i } }
outBuf.frameLength = AVAudioFrameCount(min(Int(outBuf.frameLength), last + 44100 / 4))
let g = 0.89 / max(peak, 1e-6); for i in 0..<Int(outBuf.frameLength) { d[i] *= g; d2[i] *= g }
try? FileManager.default.removeItem(at: outURL)
do {  // scope so the file is closed (header finalised) before exit
  let of = try! AVAudioFile(forWriting: outURL, settings: [AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: 44100, AVNumberOfChannelsKey: 2, AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: true], commonFormat: .pcmFormatFloat32, interleaved: false)
  try! of.write(from: outBuf)
}
print(String(format: "%@  peak %.2f -> -1 dBFS, %.2fs", outURL.lastPathComponent, peak, Double(outBuf.frameLength) / 44100))
