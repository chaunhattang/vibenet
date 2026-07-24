package vibe.net.backend.utils;

import org.jcodec.common.io.NIOUtils;
import org.jcodec.common.io.SeekableByteChannel;
import org.jcodec.containers.mp4.demuxer.MP4Demuxer;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Probes video duration (seconds) via jcodec. Isolated behind a bean so it can be mocked
 * in tests and swapped for a richer prober (e.g. ffprobe) without touching the service.
 * Note: jcodec's demuxer targets MP4/H.264; non-MP4 containers will fail to probe and are
 * surfaced to the caller as a probe failure to decide how to handle.
 */
@Component
public class VideoDurationProbe {

    public static class ProbeException extends Exception {
        public ProbeException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public double durationSeconds(File videoFile) throws ProbeException {
        try (SeekableByteChannel channel = NIOUtils.readableChannel(videoFile)) {
            MP4Demuxer demuxer = MP4Demuxer.createMP4Demuxer(channel);
            return demuxer.getVideoTrack().getMeta().getTotalDuration();
        } catch (Exception e) {
            throw new ProbeException("Unable to probe video duration", e);
        }
    }
}
