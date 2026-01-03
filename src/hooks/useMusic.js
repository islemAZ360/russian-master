import { useState, useRef, useEffect } from 'react';

export const useMusic = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // عند تغيير الأغنية، شغلها تلقائياً
  useEffect(() => {
    if (playlist.length > 0 && isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Playback error:", e));
    }
  }, [currentTrackIndex, playlist]);

  const addFiles = (files) => {
    const newTracks = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ""), // إزالة الامتداد من الاسم
      src: URL.createObjectURL(file)
    }));
    setPlaylist(prev => [...prev, ...newTracks]);
    if (!isPlaying && playlist.length === 0) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
    }
  };

  const playPause = () => {
    if (playlist.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + playlist.length) % playlist.length);
  };

  const onEnded = () => {
    nextTrack(); // تكرار تلقائي
  };

  return {
    playlist,
    currentTrack: playlist[currentTrackIndex],
    isPlaying,
    addFiles,
    playPause,
    nextTrack,
    prevTrack,
    audioRef,
    onEnded
  };
};