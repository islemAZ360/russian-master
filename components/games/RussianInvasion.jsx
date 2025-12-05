"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMap, IconTarget, IconSword, IconShield, 
  IconTrophy, IconX, IconUsers, IconClock,
  IconCrown, IconBuildingCastle, IconTreasure
} from '@tabler/icons-react';
import confetti from 'canvas-confetti';

// خريطة روسيا مع المدن
const RUSSIAN_CITIES = [
  {
    id: 'moscow',
    name: 'Москва',
    nameAr: 'موسكو',
    region: 'وسط روسيا',
    points: 1000,
    defense: 50,
    culture: 'العاصمة التاريخية',
    unlockAt: 0,
    icon: '🏛️',
    color: '#FF6B6B',
    questions: 3,
    reward: { xp: 1000, cards: ['موسكو الذهبية'] }
  },
  {
    id: 'petersburg',
    name: 'Санкт-Петербург',
    nameAr: 'سانت بطرسبرغ',
    region: 'شمال غرب',
    points: 1500,
    defense: 70,
    culture: 'عاصمة القياصرة',
    unlockAt: 2,
    icon: '🎭',
    color: '#4ECDC4',
    questions: 4,
    reward: { xp: 1500, cards: ['قصر الشتاء'] }
  },
  {
    id: 'kazan',
    name: 'Казань',
    nameAr: 'قازان',
    region: 'تتارستان',
    points: 2000,
    defense: 90,
    culture: 'حضارة التتار',
    unlockAt: 4,
    icon: '🕌',
    color: '#FFD166',
    questions: 5,
    reward: { xp: 2000, cards: ['قلعة قازان'] }
  },
  {
    id: 'sochi',
    name: 'Сочи',
    nameAr: 'سوتشي',
    region: 'كراسنودار',
    points: 2500,
    defense: 120,
    culture: 'عروس البحر الأسود',
    unlockAt: 6,
    icon: '🏖️',
    color: '#06D6A0',
    questions: 6,
    reward: { xp: 2500, cards: ['ساحل سوتشي'] }
  },
  {
    id: 'vladivostok',
    name: 'Владивосток',
    nameAr: 'فلاديفوستوك',
    region: 'الشرق الأقصى',
    points: 3000,
    defense: 150,
    culture: 'بوابة روسيا إلى آسيا',
    unlockAt: 8,
    icon: '🌉',
    color: '#118AB2',
    questions: 7,
    reward: { xp: 3000, cards: ['جسر روسكي'] }
  }
];

// وحدات الجيش
const ARMY_UNITS = [
  { id: 'infantry', name: 'مشاة', cost: 100, attack: 10, defense: 20, icon: '🪖' },
  { id: 'tanks', name: 'دبابات', cost: 300, attack: 30, defense: 15, icon: '🚜' },
  { id: 'artillery', name: 'مدفعية', cost: 500, attack: 50, defense: 10, icon: '💥' },
  { id: 'special', name: 'قوات خاصة', cost: 1000, attack: 100, defense: 50, icon: '🎯' }
];

export default function RussianInvasion({ cards, user, onClose, onVictory }) {
  const [gameState, setGameState] = useState('map'); // map, battle, results
  const [selectedCity, setSelectedCity] = useState(null);
  const [conqueredCities, setConqueredCities] = useState([]);
  const [army, setArmy] = useState({ infantry: 10, tanks: 3, artillery: 1, special: 0 });
  const [resources, setResources] = useState(5000);
  const [battleLog, setBattleLog] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [battleQuestions, setBattleQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 دقائق للمعركة

  // مؤقت المعركة
  useEffect(() => {
    let timer;
    if (gameState === 'battle' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleBattleLoss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // بدء معركة جديدة
  const startBattle = useCallback((city) => {
    if (conqueredCities.includes(city.id)) return;
    
    // توليد أسئلة عشوائية
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const questions = shuffledCards.slice(0, city.questions).map((card, index) => ({
      id: index,
      type: Math.random() > 0.5 ? 'translation' : 'pronunciation',
      card,
      options: generateOptions(card, shuffledCards)
    }));

    setSelectedCity(city);
    setBattleQuestions(questions);
    setCurrentQuestion(0);
    setTimeLeft(180);
    setBattleLog([]);
    setGameState('battle');
    addToLog(`بدأت معركة ${city.nameAr} (${city.name})`);
  }, [cards, conqueredCities]);

  // توليد خيارات متعددة
  const generateOptions = (correctCard, allCards) => {
    const options = [correctCard.arabic];
    while (options.length < 4) {
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
      if (!options.includes(randomCard.arabic)) {
        options.push(randomCard.arabic);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  // معالجة الإجابة
  const handleAnswer = useCallback((selectedAnswer) => {
    const currentQ = battleQuestions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.card.arabic;
    
    if (isCorrect) {
      // هجوم ناجح
      const damage = calculateDamage();
      addToLog(`إجابة صحيحة! هجوم بقوة ${damage}`);
      setScore(prev => prev + 100);
      
      // تشغيل مؤثرات
      if (damage > 50) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
      }
    } else {
      // تلقي ضرر
      const damageTaken = Math.floor(Math.random() * 30) + 10;
      addToLog(`إجابة خاطئة! تلقيت ضرر ${damageTaken}`);
      setResources(prev => Math.max(0, prev - damageTaken));
    }

    // الانتقال للسؤال التالي أو إنهاء المعركة
    if (currentQuestion + 1 < battleQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishBattle(isCorrect);
    }
  }, [currentQuestion, battleQuestions]);

  // حساب الضرر بناءً على الجيش
  const calculateDamage = () => {
    let damage = 10;
    damage += army.infantry * 2;
    damage += army.tanks * 10;
    damage += army.artillery * 25;
    damage += army.special * 50;
    return damage;
  };

  // إنهاء المعركة
  const finishBattle = (victory) => {
    if (victory) {
      addToLog(`انتصار! فتحت مدينة ${selectedCity.nameAr}`);
      setConqueredCities(prev => [...prev, selectedCity.id]);
      setResources(prev => prev + selectedCity.points);
      
      // مكافآت الفوز
      confetti({ particleCount: 200, spread: 100 });
      
      if (onVictory) {
        onVictory(selectedCity.reward);
      }
    } else {
      addToLog(`هزيمة! لم تستطع فتح ${selectedCity.nameAr}`);
    }
    
    setTimeout(() => {
      setGameState('map');
      setSelectedCity(null);
    }, 3000);
  };

  // خسارة المعركة بالوقت
  const handleBattleLoss = () => {
    addToLog('انتهى الوقت! هزيمة');
    finishBattle(false);
  };

  // إضافة رسالة للسجل
  const addToLog = (message) => {
    setBattleLog(prev => [
      { id: Date.now(), message, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // الاحتفاظ بـ10 رسائل فقط
    ]);
  };

  // شراء وحدات جيش
  const buyUnit = (unitId) => {
    const unit = ARMY_UNITS.find(u => u.id === unitId);
    if (resources >= unit.cost) {
      setResources(prev => prev - unit.cost);
      setArmy(prev => ({
        ...prev,
        [unitId]: prev[unitId] + 1
      }));
      addToLog(`اشتريت وحدة ${unit.name}`);
    }
  };

  // تقدير قوة الهجوم
  const calculateAttackPower = () => {
    return Object.entries(army).reduce((total, [unitId, count]) => {
      const unit = ARMY_UNITS.find(u => u.id === unitId);
      return total + (unit.attack * count);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full h-full max-w-6xl bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-yellow-500/30 bg-black/50 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <IconMap size={32} className="text-yellow-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">الغزو الروسي</h1>
                <p className="text-yellow-400/70 text-sm">اخترق المدن بالإجابات الصحيحة</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{resources}</div>
                <div className="text-xs text-yellow-400">موارد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{conqueredCities.length}/5</div>
                <div className="text-xs text-green-400">مدن محررة</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <IconX size={24} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* الخريطة */}
          {gameState === 'map' && (
            <>
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {RUSSIAN_CITIES.map((city) => {
                    const isConquered = conqueredCities.includes(city.id);
                    const isLocked = conqueredCities.length < city.unlockAt;
                    
                    return (
                      <motion.div
                        key={city.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: isLocked ? 1 : 1.05 }}
                        className={`relative rounded-2xl p-6 border-2 backdrop-blur-sm transition-all ${
                          isConquered
                            ? 'border-green-500 bg-green-500/10'
                            : isLocked
                            ? 'border-gray-700 bg-gray-800/50 opacity-50'
                            : 'border-yellow-500/50 bg-black/30 hover:border-yellow-500 hover:bg-black/50 cursor-pointer'
                        }`}
                        onClick={isLocked ? undefined : () => startBattle(city)}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
                            <div className="text-center">
                              <IconClock className="text-gray-400 mx-auto mb-2" />
                              <div className="text-gray-400 text-sm">تحتاج {city.unlockAt - conqueredCities.length} مدن أخرى</div>
                            </div>
                          </div>
                        )}
                        
                        {isConquered && (
                          <div className="absolute top-4 right-4 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                            محررة ✓
                          </div>
                        )}
                        
                        <div className="text-5xl mb-4">{city.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-2">{city.nameAr}</h3>
                        <div className="text-sm text-white/50 mb-1">🇷🇺 {city.name}</div>
                        <div className="text-xs text-yellow-400 mb-3">{city.region}</div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">النقاط:</span>
                            <span className="text-yellow-400 font-bold">{city.points}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">الدفاع:</span>
                            <span className="text-red-400 font-bold">{city.defense}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">الأسئلة:</span>
                            <span className="text-blue-400 font-bold">{city.questions}</span>
                          </div>
                        </div>
                        
                        {!isConquered && !isLocked && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all"
                          >
                            <IconSword className="inline mr-2" />
                            ابدأ الغزو
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              
              {/* لوحة الجيش */}
              <div className="w-96 border-l border-white/10 p-6 bg-black/30 overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <IconShield className="text-blue-500" />
                  جيشك
                </h3>
                
                <div className="space-y-4 mb-8">
                  {ARMY_UNITS.map(unit => (
                    <div key={unit.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{unit.icon}</span>
                          <div>
                            <div className="font-bold text-white">{unit.name}</div>
                            <div className="text-xs text-white/50">قوة: {unit.attack} | دفاع: {unit.defense}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-black text-yellow-400">{army[unit.id]}</div>
                      </div>
                      <button
                        onClick={() => buyUnit(unit.id)}
                        disabled={resources < unit.cost}
                        className={`w-full py-2 rounded-lg font-bold transition-all ${
                          resources >= unit.cost
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        شراء ({unit.cost} 💰)
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* إحصائيات */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">إحصائيات المعركة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">قوة الهجوم:</span>
                      <span className="text-red-400 font-bold">{calculateAttackPower()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">نسبة النصر:</span>
                      <span className="text-green-400 font-bold">
                        {Math.min(95, conqueredCities.length * 15 + 30)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">الخبرة:</span>
                      <span className="text-yellow-400 font-bold">{score} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* شاشة المعركة */}
          {gameState === 'battle' && selectedCity && (
            <div className="flex-1 flex flex-col p-8">
              {/* معلومات المعركة */}
              <div className="flex justify-between items-center mb-8 p-4 bg-black/50 rounded-2xl border border-yellow-500/30">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedCity.icon}</div>
                  <div>
                    <h2 className="text-2xl font-black text-white">معركة {selectedCity.nameAr}</h2>
                    <div className="text-yellow-400">سؤال {currentQuestion + 1} من {battleQuestions.length}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{timeLeft}</div>
                    <div className="text-xs text-cyan-400">ثانية</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{score}</div>
                    <div className="text-xs text-green-400">نقاط</div>
                  </div>
                </div>
              </div>

              {/* السؤال */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {battleQuestions[currentQuestion] && (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-sm text-white/50 mb-2">أجب بشكل صحيح لتسبب ضرراً!</div>
                      <h3 className="text-4xl font-black text-white mb-6">
                        {battleQuestions[currentQuestion].type === 'translation' 
                          ? `ما معنى "${battleQuestions[currentQuestion].card.russian}"؟`
                          : 'استمع واختر المعنى الصحيح:'}
                      </h3>
                      
                      {battleQuestions[currentQuestion].type === 'pronunciation' && (
                        <button
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(
                              battleQuestions[currentQuestion].card.russian
                            );
                            utterance.lang = 'ru-RU';
                            utterance.rate = 0.8;
                            window.speechSynthesis.speak(utterance);
                          }}
                          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full mb-8 transition-all"
                        >
                          🔊 استمع للنطق
                        </button>
                      )}
                    </div>

                    {/* الخيارات */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                      {battleQuestions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAnswer(option)}
                          className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold hover:bg-white/10 hover:border-blue-500/50 transition-all text-center"
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* سجل المعركة */}
              <div className="mt-8 h-48 overflow-y-auto bg-black/30 rounded-xl p-4 border border-white/10">
                <h4 className="font-bold text-white mb-3">سجل المعركة</h4>
                <div className="space-y-2">
                  {battleLog.map(log => (
                    <div key={log.id} className="text-sm p-2 bg-white/5 rounded">
                      <span className="text-cyan-400">[{log.time}]</span>
                      <span className="text-white ml-2">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}