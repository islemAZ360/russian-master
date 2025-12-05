"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  IconVideo, IconMessageCircle, IconUsers, IconSend, 
  IconX, IconHeart, IconShare, IconGift, IconCrown,
  IconMicrophone, IconScreenShare, IconSettings
} from '@tabler/icons-react';
import { db } from '../../lib/firebase';
import { 
  collection, addDoc, onSnapshot, query, 
  orderBy, serverTimestamp, doc, updateDoc 
} from 'firebase/firestore';

// دروس مباشرة مجدولة
const SCHEDULED_LESSONS = [
  {
    id: 1,
    title: 'القواعد الأساسية للمبتدئين',
    teacher: 'آنا إيفانوفا',
    time: '18:00',
    duration: '45 دقيقة',
    level: 'مبتدئ',
    description: 'تعلم الحروف والأفعال الأساسية',
    attendees: 124
  },
  {
    id: 2,
    title: 'المحادثة اليومية',
    teacher: 'دميتري بتروف',
    time: '20:00',
    duration: '60 دقيقة',
    level: 'متوسط',
    description: 'حوارات عملية في مواقف حقيقية',
    attendees: 89
  },
  {
    id: 3,
    title: 'الأدب الروسي الكلاسيكي',
    teacher: 'أولغا سيمونوفا',
    time: '22:00',
    duration: '90 دقيقة',
    level: 'متقدم',
    description: 'قراءة وتحليل نصوص أدبية',
    attendees: 56
  }
];

export default function LiveStream({ user, onClose }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [viewers, setViewers] = useState(0);
  const [isTeacher, setIsTeacher] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [polls, setPolls] = useState([]);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  // محاكاة بث فيديو
  useEffect(() => {
    if (activeLesson && videoRef.current) {
      // في الإصدار الحقيقي، هنا يكون اتصال WebRTC
      const stream = new MediaStream();
      videoRef.current.srcObject = stream;
    }
  }, [activeLesson]);

  // جلب الرسائل من Firebase
  useEffect(() => {
    if (!activeLesson) return;

    const q = query(
      collection(db, 'live_streams', activeLesson.id.toString(), 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [activeLesson]);

  // تحديث عدد المشاهدين
  useEffect(() => {
    if (activeLesson) {
      const interval = setInterval(() => {
        setViewers(prev => prev + Math.floor(Math.random() * 10) - 3);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeLesson]);

  // التمرير للرسائل الجديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // بدء درس جديد
  const startLesson = (lesson) => {
    setActiveLesson(lesson);
    setIsTeacher(user?.email === 'teacher@russian.com'); // محاكاة
    setViewers(lesson.attendees);
    setMessages([]);
  };

  // إرسال رسالة
  const sendMessage = async () => {
    if (!input.trim() || !activeLesson || !user) return;

    const message = {
      text: input,
      user: user.email,
      userName: user.displayName || user.email.split('@')[0],
      timestamp: serverTimestamp(),
      type: 'message',
      isTeacher: isTeacher
    };

    try {
      await addDoc(
        collection(db, 'live_streams', activeLesson.id.toString(), 'messages'),
        message
      );
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // إرسال تفاعل
  const sendReaction = async (reaction) => {
    if (!activeLesson || !user) return;

    const reactionMsg = {
      type: 'reaction',
      reaction,
      user: user.email,
      timestamp: serverTimestamp()
    };

    await addDoc(
      collection(db, 'live_streams', activeLesson.id.toString(), 'messages'),
      reactionMsg
    );

    // عرض التفاعل مؤقتاً
    setReactions(prev => [...prev, { id: Date.now(), reaction }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id > Date.now() - 3000));
    }, 3000);
  };

  // إنشاء استطلاع
  const createPoll = async () => {
    if (!isTeacher || !activeLesson) return;

    const poll = {
      id: Date.now(),
      question: 'ما الصعوبة التي تواجهها في النطق؟',
      options: ['الحروف الصعبة', 'التركيب', 'السرعة', 'التشديد'],
      votes: {},
      active: true
    };

    setPolls([poll]);
  };

  // التصويت في استطلاع
  const voteInPoll = async (pollId, optionIndex) => {
    const pollRef = doc(db, 'live_streams', activeLesson.id.toString(), 'polls', pollId.toString());
    await updateDoc(pollRef, {
      [`votes.${user.uid}`]: optionIndex
    });
  };

  // تبرع (هدية)
  const sendGift = async (giftType) => {
    const gift = {
      type: giftType,
      from: user.email,
      timestamp: serverTimestamp(),
      value: getGiftValue(giftType)
    };

    await addDoc(
      collection(db, 'live_streams', activeLesson.id.toString(), 'gifts'),
      gift
    );
  };

  const getGiftValue = (type) => {
    const values = {
      'heart': 10,
      'star': 50,
      'crown': 100,
      'rocket': 500
    };
    return values[type] || 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-black flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">القناة التعليمية الحية</h1>
            <div className="flex items-center gap-4 text-sm text-purple-300">
              <span className="flex items-center gap-1">
                <IconUsers size={16} /> {viewers} مشاهد
              </span>
              {activeLesson && (
                <>
                  <span>المستوى: {activeLesson.level}</span>
                  <span>المعلم: {activeLesson.teacher}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
        >
          <IconX size={24} className="text-red-500" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* الشاشة الرئيسية */}
        <div className="flex-1 flex flex-col">
          {/* الفيديو */}
          <div className="relative flex-1 bg-black">
            {activeLesson ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-contain"
                />
                
                {/* تفاعلات تطفو */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {reactions.map(r => (
                    <div
                      key={r.id}
                      className="text-3xl animate-bounce"
                      style={{ animationDelay: `${Math.random()}s` }}
                    >
                      {r.reaction}
                    </div>
                  ))}
                </div>

                {/* معلومات الدرس */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm p-4 rounded-xl max-w-md">
                  <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                  <p className="text-white/70 mb-2">{activeLesson.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400">● مباشر</span>
                    <span className="text-white/50">{activeLesson.duration}</span>
                    <span className="text-yellow-400">{activeLesson.level}</span>
                  </div>
                </div>

                {/* أدوات المعلم */}
                {isTeacher && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm p-4 rounded-xl">
                    <h3 className="text-white font-bold mb-2">أدوات المعلم</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={createPoll}
                        className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500"
                      >
                        استطلاع
                      </button>
                      <button className="p-2 bg-green-600 rounded-lg text-white hover:bg-green-500">
                        <IconScreenShare size={20} />
                      </button>
                      <button className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500">
                        <IconSettings size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <IconVideo size={120} className="text-purple-500/30 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">لا يوجد بث نشط</h2>
                <p className="text-white/50 mb-8">اختر درساً من الجدول</p>
              </div>
            )}
          </div>

          {/* الاستطلاعات */}
          {polls.length > 0 && (
            <div className="p-4 border-t border-white/10 bg-black/50">
              {polls.map(poll => (
                <div key={poll.id} className="max-w-md mx-auto">
                  <h4 className="text-white font-bold mb-2">{poll.question}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {poll.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => voteInPoll(poll.id, idx)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الشريط الجانبي */}
        <div className="w-96 border-l border-white/10 flex flex-col bg-black/30">
          {/* قائمة الدروس */}
          {!activeLesson ? (
            <div className="p-4 overflow-y-auto flex-1">
              <h3 className="text-xl font-bold text-white mb-4">الدروس المجدولة</h3>
              <div className="space-y-4">
                {SCHEDULED_LESSONS.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => startLesson(lesson)}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{lesson.title}</h4>
                      <span className="text-sm text-green-400">{lesson.time}</span>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{lesson.description}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-yellow-400">{lesson.level}</span>
                      <span className="text-white/50 flex items-center gap-1">
                        <IconUsers size={12} /> {lesson.attendees}
                      </span>
                      <span className="text-cyan-400">{lesson.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* الدردشة */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <IconMessageCircle size={20} /> دردشة البث
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.isTeacher
                          ? 'bg-purple-900/30 border-l-4 border-purple-500'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className={`font-bold ${
                          msg.isTeacher ? 'text-purple-300' : 'text-cyan-300'
                        }`}>
                          {msg.isTeacher ? '👑 ' : ''}{msg.userName}
                        </span>
                        <span className="text-xs text-white/30">
                          {msg.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white">{msg.text}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* أدوات التفاعل */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2 mb-3">
                    {['❤️', '👏', '🎉', '🔥', '🤯'].map(reaction => (
                      <button
                        key={reaction}
                        onClick={() => sendReaction(reaction)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xl transition-colors"
                      >
                        {reaction}
                      </button>
                    ))}
                    <button
                      onClick={() => sendGift('heart')}
                      className="p-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg text-pink-400"
                    >
                      <IconGift size={20} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      <IconSend size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}