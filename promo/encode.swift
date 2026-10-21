// Encode promo/out/frames/*.jpg + music into an MP4 (H.264 + AAC) with a music fade-out.
// Usage: encode <framesDir> <music.mp3> <out.mp4> <fps> <width> <height> <videoBitrate>
//   full:     encode out/frames assets/music.mp3 out/clear-signs-promo.mp4 30 1080 1920 9000000
//   whatsapp: encode out/frames assets/music.mp3 out/clear-signs-promo-whatsapp.mp4 30 720 1280 2200000
import AVFoundation
import AppKit

let a = CommandLine.arguments
let framesDir = a[1], musicPath = a[2], outPath = a[3]
let fps = Int32(a[4])!, W = Int(a[5])!, H = Int(a[6])!, bitrate = Int(a[7])!
let files = try! FileManager.default.contentsOfDirectory(atPath: framesDir).filter { $0.hasSuffix(".jpg") }.sorted()
let dur = CMTime(value: CMTimeValue(files.count), timescale: fps)
func wait(_ f: (@escaping () -> Void) -> Void) { let s = DispatchSemaphore(value: 0); f { s.signal() }; s.wait() }

// 1. video only, at the requested size and bitrate
let videoURL = URL(fileURLWithPath: outPath + ".v.mp4"); try? FileManager.default.removeItem(at: videoURL)
let writer = try! AVAssetWriter(outputURL: videoURL, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(input); writer.startWriting(); writer.startSession(atSourceTime: .zero)
for (i, f) in files.enumerated() {
  autoreleasepool {
    let img = NSImage(contentsOfFile: framesDir + "/" + f)!
    let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil)!
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!),
                        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    ctx.interpolationQuality = .high
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    while !input.isReadyForMoreMediaData { usleep(1000) }
    adaptor.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
  }
}
input.markAsFinished()
wait { done in writer.finishWriting { done() } }

// 2. music trimmed to the video length with a 2.5 s fade-out (exported on its own so the video is not re-encoded)
let music = AVURLAsset(url: URL(fileURLWithPath: musicPath))
let ac = AVMutableComposition()
let at = ac.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
try! at.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: music.tracks(withMediaType: .audio)[0], at: .zero)
let p = AVMutableAudioMixInputParameters(track: at)
let fade = CMTime(seconds: 2.5, preferredTimescale: 600)
p.setVolumeRamp(fromStartVolume: 1, toEndVolume: 0, timeRange: CMTimeRange(start: CMTimeSubtract(dur, fade), duration: fade))
let mix = AVMutableAudioMix(); mix.inputParameters = [p]
let audioURL = URL(fileURLWithPath: outPath + ".a.m4a"); try? FileManager.default.removeItem(at: audioURL)
let ae = AVAssetExportSession(asset: ac, presetName: AVAssetExportPresetAppleM4A)!
ae.audioMix = mix; ae.outputURL = audioURL; ae.outputFileType = .m4a
wait { done in ae.exportAsynchronously { done() } }

// 3. join video + faded music without re-encoding
let v = AVURLAsset(url: videoURL), au = AVURLAsset(url: audioURL)
let comp = AVMutableComposition()
try! comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: v.tracks(withMediaType: .video)[0], at: .zero)
try! comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: au.tracks(withMediaType: .audio)[0], at: .zero)
let outURL = URL(fileURLWithPath: outPath); try? FileManager.default.removeItem(at: outURL)
let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough)!
ex.outputURL = outURL; ex.outputFileType = .mp4; ex.shouldOptimizeForNetworkUse = true
wait { done in ex.exportAsynchronously { done() } }
print("export status \(ex.status.rawValue) (3 = completed), audio status \(ae.status.rawValue), frames \(files.count), \(W)x\(H)")
try? FileManager.default.removeItem(at: videoURL); try? FileManager.default.removeItem(at: audioURL)
