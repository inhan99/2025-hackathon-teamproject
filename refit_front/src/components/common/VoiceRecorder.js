import React, { useState, useRef, useCallback } from "react";
import { FaMicrophone, FaStop, FaPlay, FaPause } from "react-icons/fa";

const VoiceRecorder = ({ onRecordingComplete, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // WebM Opus 형식으로 녹음 (Google Cloud Speech-to-Text API 지원)
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setRecordingTime(0);

        // 녹음 완료 콜백 호출
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // 녹음 시간 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("마이크 접근 실패:", error);
      if (onError) {
        onError("마이크 접근에 실패했습니다. 브라우저 설정을 확인해주세요.");
      }
    }
  }, [onRecordingComplete, onError]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
  }, [isRecording]);

  // 녹음 재생
  const playRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // 재생 중지
  const pauseRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // 녹음 재시작
  const restartRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  // 녹음 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* 녹음 상태 표시 */}
      <div className="text-center">
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-semibold">
              녹음 중... {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      {/* 녹음 버튼들 */}
      <div className="flex items-center space-x-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex items-center justify-center w-16 h-16 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="녹음 시작"
          >
            <FaMicrophone size={24} />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-16 h-16 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
            title="녹음 중지"
          >
            <FaStop size={24} />
          </button>
        )}

        {audioBlob && !isRecording && (
          <>
            <button
              onClick={isPlaying ? pauseRecording : playRecording}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title={isPlaying ? "재생 중지" : "재생"}
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>

            <button
              onClick={restartRecording}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="다시 녹음"
            >
              다시 녹음
            </button>
          </>
        )}
      </div>

      {/* 오디오 플레이어 (숨김) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* 안내 메시지 */}
      <div className="text-sm text-gray-600 text-center">
        {!audioBlob && !isRecording && "마이크 버튼을 눌러 음성을 녹음하세요"}
        {isRecording && "녹음 중입니다. 중지 버튼을 눌러 완료하세요"}
        {audioBlob &&
          !isRecording &&
          "녹음이 완료되었습니다. 재생하거나 다시 녹음할 수 있습니다"}
      </div>
    </div>
  );
};

export default VoiceRecorder;
