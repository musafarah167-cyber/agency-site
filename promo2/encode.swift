// Encode promo2 frames + voiceover lines + music into an MP4 (H.264 + AAC).
// Usage: encode <framesDir> <music> <out.mp4> <fps> <W> <H> <bitrate> <voiceDir> <t1,t2,...>
// Voice files are <voiceDir>/l1.aiff ... placed at the given start times (seconds). Music is ducked under the voice.
import AVFoundation
import AppKit
let a = CommandLine.arguments
let framesDir = a[1], musicPath = a[2], outPath = a[3]
let fps = Int32(a[4])!, W = Int(a[5])!, H = Int(a[6])!, bitrate = Int(a[7])!, voiceDir = a[8]
let starts = a[9].split(separator: ",").map { Double($0)! }
let files = try! FileManager.default.contentsOfDirectory(atPath: framesDir).filter { $0.hasSuffix(".jpg") }.sorted()
let dur = CMTime(value: CMTimeValue(files.count), timescale: fps)
func wait(_ f: (@escaping () -> Void) -> Void) { let s = DispatchSemaphore(value: 0); f { s.signal() }; s.wait() }
func sec(_ x: Double) -> CMTime { CMTime(seconds: x, preferredTimescale: 600) }

// 1. video
let videoURL = URL(fileURLWithPath: outPath + ".v.mp4"); try? FileManager.default.removeItem(at: videoURL)
let writer = try! AVAssetWriter(outputURL: videoURL, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(input); writer.startWriting(); writer.startSession(atSourceTime: .zero)
for (i, f) in files.enumerated() {
  autoreleasepool {
    let cg = NSImage(contentsOfFile: framesDir + "/" + f)!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
    var pb: CVPixelBuffer?; CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!),
                        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    ctx.interpolationQuality = .high; ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    while !input.isReadyForMoreMediaData { usleep(1000) }
    adaptor.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
  }
}
input.markAsFinished(); wait { done in writer.finishWriting { done() } }

// 2. audio: music (ducked) + voice lines at their start times
let ac = AVMutableComposition()
let music = AVURLAsset(url: URL(fileURLWithPath: musicPath))
let mt = ac.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
try! mt.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: music.tracks(withMediaType: .audio)[0], at: .zero)
let vt = ac.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
var voiceRanges: [(Double, Double)] = []
for (i, st) in starts.enumerated() {
  let v = AVURLAsset(url: URL(fileURLWithPath: "\(voiceDir)/l\(i + 1).aiff"))
  let vd = v.duration
  try! vt.insertTimeRange(CMTimeRange(start: .zero, duration: vd), of: v.tracks(withMediaType: .audio)[0], at: sec(st))
  voiceRanges.append((st, st + CMTimeGetSeconds(vd)))
}
let mp = AVMutableAudioMixInputParameters(track: mt)
let lo: Float = 0.17, hi: Float = 0.55
mp.setVolumeRamp(fromStartVolume: 0, toEndVolume: hi, timeRange: CMTimeRange(start: .zero, duration: sec(0.6)))
var level = hi
for (k, (st, en)) in voiceRanges.enumerated() {   // duck under each line; swell back up in gaps longer than 0.9 s
  if level != lo { mp.setVolumeRamp(fromStartVolume: level, toEndVolume: lo, timeRange: CMTimeRange(start: sec(max(0.6, st - 0.3)), duration: sec(0.25))); level = lo }
  let next = k + 1 < voiceRanges.count ? voiceRanges[k + 1].0 : CMTimeGetSeconds(dur) - 2.0
  if next - en > 0.9 { mp.setVolumeRamp(fromStartVolume: lo, toEndVolume: hi, timeRange: CMTimeRange(start: sec(en - 0.2), duration: sec(0.35))); level = hi }
}
let total = CMTimeGetSeconds(dur)
mp.setVolumeRamp(fromStartVolume: level, toEndVolume: 0, timeRange: CMTimeRange(start: sec(total - 2.0), duration: sec(2.0)))
let vp = AVMutableAudioMixInputParameters(track: vt); vp.setVolume(1.0, at: .zero)
let mix = AVMutableAudioMix(); mix.inputParameters = [mp, vp]
let audioURL = URL(fileURLWithPath: outPath + ".a.m4a"); try? FileManager.default.removeItem(at: audioURL)
let ae = AVAssetExportSession(asset: ac, presetName: AVAssetExportPresetAppleM4A)!
ae.audioMix = mix; ae.outputURL = audioURL; ae.outputFileType = .m4a
wait { done in ae.exportAsynchronously { done() } }

// 3. mux
let v = AVURLAsset(url: videoURL), au = AVURLAsset(url: audioURL)
let comp = AVMutableComposition()
try! comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: v.tracks(withMediaType: .video)[0], at: .zero)
try! comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!.insertTimeRange(CMTimeRange(start: .zero, duration: min(dur, au.duration)), of: au.tracks(withMediaType: .audio)[0], at: .zero)
let outURL = URL(fileURLWithPath: outPath); try? FileManager.default.removeItem(at: outURL)
let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough)!
ex.outputURL = outURL; ex.outputFileType = .mp4; ex.shouldOptimizeForNetworkUse = true
wait { done in ex.exportAsynchronously { done() } }
print("export \(ex.status.rawValue) (3 = ok), audio \(ae.status.rawValue) \(ae.error?.localizedDescription ?? ""), frames \(files.count), \(W)x\(H)")
try? FileManager.default.removeItem(at: videoURL); try? FileManager.default.removeItem(at: audioURL)
