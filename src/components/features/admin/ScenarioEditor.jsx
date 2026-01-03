"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  IconScript, IconPlus, IconTrash, IconPlayerPlay, 
  IconDownload, IconUpload, IconEye, IconCode,
  IconMovie, IconMusic, IconPhoto, IconDeviceGamepad,
  IconChevronRight, IconCopy, IconCheck
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

// عناصر السيناريو
const SCENARIO_ELEMENTS = [
  { type: 'dialogue', icon: '💬', label: 'حوار', color: '#3B82F6' },
  { type: 'choice', icon: '🔀', label: 'اختيار', color: '#10B981' },
  { type: 'quiz', icon: '❓', label: 'سؤال', color: '#F59E0B' },
  { type: 'audio', icon: '🎵', label: 'صوت', color: '#8B5CF6' },
  { type: 'image', icon: '🖼️', label: 'صورة', color: '#EC4899' },
  { type: 'video', icon: '🎥', label: 'فيديو', color: '#EF4444' },
  { type: 'wait', icon: '⏱️', label: 'انتظار', color: '#6B7280' },
  { type: 'branch', icon: '🌳', label: 'فرع', color: '#059669' }
];

// خلفيات جاهزة
const BACKGROUNDS = [
  { id: 'classroom', name: 'فصل دراسي', url: '/backgrounds/classroom.jpg', category: 'education' },
  { id: 'moscow', name: 'موسكو', url: '/backgrounds/moscow.jpg', category: 'city' },
  { id: 'forest', name: 'غابة روسية', url: '/backgrounds/forest.jpg', category: 'nature' },
  { id: 'station', name: 'محطة قطار', url: '/backgrounds/station.jpg', category: 'transport' },
  { id: 'market', name: 'سوق', url: '/backgrounds/market.jpg', category: 'city' },
  { id: 'home', name: 'منزل', url: '/backgrounds/home.jpg', category: 'interior' }
];

// شخصيات جاهزة
const CHARACTERS = [
  { id: 'teacher', name: 'المعلم', image: '/characters/teacher.png', expressions: ['normal', 'happy', 'angry'] },
  { id: 'student', name: 'الطالب', image: '/characters/student.png', expressions: ['normal', 'confused', 'excited'] },
  { id: 'tourist', name: 'سائح', image: '/characters/tourist.png', expressions: ['normal', 'lost', 'happy'] },
  { id: 'shopkeeper', name: 'بائع', image: '/characters/shopkeeper.png', expressions: ['normal', 'smiling', 'angry'] }
];

export default function ScenarioEditor() {
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(null);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [characters, setCharacters] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [title, setTitle] = useState('سيناريو جديد');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('ar');
  const [variables, setVariables] = useState({});
  const [copied, setCopied] = useState(false);

  // إضافة مشهد جديد
  const addScene = (type) => {
    const newScene = {
      id: Date.now(),
      type,
      title: `مشهد ${scenes.length + 1}`,
      content: getDefaultContent(type),
      position: { x: scenes.length * 200, y: 100 },
      connections: []
    };
    
    setScenes([...scenes, newScene]);
    setSelectedScene(newScene.id);
  };

  // محتوى افتراضي حسب النوع
  const getDefaultContent = (type) => {
    switch (type) {
      case 'dialogue':
        return {
          character: CHARACTERS[0].id,
          expression: 'normal',
          text: '',
          audio: null,
          duration: 3
        };
      case 'choice':
        return {
          question: '',
          options: [
            { text: '', nextScene: null },
            { text: '', nextScene: null }
          ]
        };
      case 'quiz':
        return {
          question: '',
          correctAnswer: '',
          wrongAnswers: ['', '', ''],
          explanation: '',
          points: 10
        };
      case 'audio':
        return {
          file: null,
          text: '',
          autoplay: true,
          loop: false
        };
      default:
        return {};
    }
  };

  // تحديث مشهد
  const updateScene = (sceneId, updates) => {
    setScenes(scenes.map(scene =>
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
  };

  // حذف مشهد
  const deleteScene = (sceneId) => {
    setScenes(scenes.filter(scene => scene.id !== sceneId));
    if (selectedScene === sceneId) {
      setSelectedScene(scenes.length > 1 ? scenes[0].id : null);
    }
  };

  // إضافة شخصية
  const addCharacter = (characterId) => {
    if (!characters.some(c => c.id === characterId)) {
      const character = CHARACTERS.find(c => c.id === characterId);
      setCharacters([...characters, {
        ...character,
        position: { x: 100, y: 300 },
        size: 1
      }]);
    }
  };

  // معاينة السيناريو
  const previewScenario = () => {
    setPreviewMode(true);
  };

  // تصدير السيناريو
  const exportScenario = () => {
    const scenarioData = {
      title,
      description,
      language,
      background,
      characters,
      scenes,
      variables,
      createdAt: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(scenarioData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${title.replace(/\s+/g, '_')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // نسخ الكود البرمجي
  const copyCode = () => {
    const code = generateReactCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // توليد كود React للسيناريو
  const generateReactCode = () => {
    return `import React, { useState } from 'react';

const ${title.replace(/\s+/g, '')}Scenario = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [score, setScore] = useState(0);
  
  const scenes = ${JSON.stringify(scenes, null, 2)};
  
  const renderScene = (scene) => {
    switch (scene.type) {
      case 'dialogue':
        return (
          <div className="dialogue-scene">
            <h3>{scene.content.character}</h3>
            <p>{scene.content.text}</p>
          </div>
        );
      case 'choice':
        return (
          <div className="choice-scene">
            <h3>{scene.content.question}</h3>
            {scene.content.options.map((option, idx) => (
              <button key={idx} onClick={() => handleChoice(option.nextScene)}>
                {option.text}
              </button>
            ))}
          </div>
        );
      default:
        return <div>مشهد غير معروف</div>;
    }
  };
  
  return (
    <div className="scenario-player">
      {renderScene(scenes[currentScene])}
    </div>
  );
};

export default ${title.replace(/\s+/g, '')}Scenario;`;
  };

  return (
    <div className="w-full h-full flex bg-[#0a0a0a] text-white">
      {/* شريط الأدوات */}
      <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 space-y-4">
        {SCENARIO_ELEMENTS.map(element => (
          <button
            key={element.type}
            onClick={() => addScene(element.type)}
            className="p-3 rounded-lg hover:bg-white/10 transition-colors group relative"
            style={{ color: element.color }}
          >
            <span className="text-2xl">{element.icon}</span>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {element.label}
            </div>
          </button>
        ))}
      </div>

      {/* محرر السيناريو */}
      <div className="flex-1 flex flex-col">
        {/* شريط التحكم العلوي */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconScript size={32} className="text-purple-500" />
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none outline-none text-white"
                placeholder="اسم السيناريو"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm text-white/50 bg-transparent border-none outline-none w-96"
                placeholder="وصف السيناريو"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={previewMode ? () => setPreviewMode(false) : previewScenario}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2"
            >
              {previewMode ? <IconEye size={20} /> : <IconPlayerPlay size={20} />}
              {previewMode ? 'تعديل' : 'معاينة'}
            </button>
            <button
              onClick={exportScenario}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center gap-2"
            >
              <IconDownload size={20} />
              تصدير
            </button>
            <button
              onClick={copyCode}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-2"
            >
              {copied ? <IconCheck size={20} /> : <IconCode size={20} />}
              {copied ? 'تم النسخ!' : 'كود'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* لوحة المشاهد */}
          <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
            <h3 className="font-bold text-white mb-4">المشاهد ({scenes.length})</h3>
            <div className="space-y-2">
              {scenes.map(scene => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedScene === scene.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{SCENARIO_ELEMENTS.find(e => e.type === scene.type)?.icon}</span>
                      <span className="font-bold">{scene.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(scene.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-white/50 truncate">
                    {scene.type} • {scene.id}
                  </div>
                </div>
              ))}
            </div>

            {/* المكتبة */}
            <div className="mt-8">
              <h4 className="font-bold text-white mb-3">المكتبة</h4>
              
              <div className="mb-4">
                <h5 className="text-sm text-white/70 mb-2">الخلفيات</h5>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUNDS.map(bg => (
                    <div
                      key={bg.id}
                      onClick={() => setBackground(bg)}
                      className={`aspect-video rounded overflow-hidden cursor-pointer border-2 ${
                        background.id === bg.id ? 'border-purple-500' : 'border-transparent'
                      }`}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center text-xs">
                        {bg.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm text-white/70 mb-2">الشخصيات</h5>
                <div className="space-y-2">
                  {CHARACTERS.map(char => (
                    <div
                      key={char.id}
                      onClick={() => addCharacter(char.id)}
                      className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500"></div>
                      <span className="text-sm">{char.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* منطقة العمل */}
          <div className="flex-1 p-4 overflow-auto">
            {previewMode ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/10">
                <div className="text-center">
                  <IconMovie size={64} className="text-purple-500/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">وضع المعاينة</h3>
                  <p className="text-white/50 mb-6">هنا سيظهر تشغيل السيناريو</p>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
                  >
                    العودة للتعديل
                  </button>
                </div>
              </div>
            ) : selectedScene ? (
              <div className="max-w-4xl mx-auto">
                {(() => {
                  const scene = scenes.find(s => s.id === selectedScene);
                  if (!scene) return null;

                  switch (scene.type) {
                    case 'dialogue':
                      return (
                        <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
                          <h3 className="text-xl font-bold text-white mb-6">✏️ حوار</h3>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white/70 mb-2">الشخصية</label>
                              <select
                                value={scene.content.character}
                                onChange={(e) => updateScene(scene.id, {
                                  content: { ...scene.content, character: e.target.value }
                                })}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white"
                              >
                                {CHARACTERS.map(char => (
                                  <option key={char.id} value={char.id}>{char.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white/70 mb-2">التعبير</label>
                              <select
                                value={scene.content.expression}
                                onChange={(e) => updateScene(scene.id, {
                                  content: { ...scene.content, expression: e.target.value }
                                })}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white"
                              >
                                <option value="normal">عادي</option>
                                <option value="happy">سعيد</option>
                                <option value="angry">غاضب</option>
                                <option value="confused">مرتبك</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <label className="block text-white/70 mb-2">النص</label>
                            <textarea
                              value={scene.content.text}
                              onChange={(e) => updateScene(scene.id, {
                                content: { ...scene.content, text: e.target.value }
                              })}
                              className="w-full h-48 bg-black border border-white/20 rounded-lg p-3 text-white resize-none"
                              placeholder="اكتب النص هنا..."
                            />
                          </div>
                          
                          <div className="mt-6">
                            <label className="block text-white/70 mb-2">المدة (ثواني)</label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={scene.content.duration}
                              onChange={(e) => updateScene(scene.id, {
                                content: { ...scene.content, duration: parseInt(e.target.value) }
                              })}
                              className="w-full"
                            />
                            <div className="text-center text-white/50">{scene.content.duration} ثانية</div>
                          </div>
                        </div>
                      );

                    case 'choice':
                      return (
                        <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
                          <h3 className="text-xl font-bold text-white mb-6">🔀 اختيار متعدد</h3>
                          
                          <div className="mb-6">
                            <label className="block text-white/70 mb-2">السؤال</label>
                            <input
                              type="text"
                              value={scene.content.question}
                              onChange={(e) => updateScene(scene.id, {
                                content: { ...scene.content, question: e.target.value }
                              })}
                              className="w-full bg-black border border-white/20 rounded-lg p-3 text-white"
                              placeholder="اسأل سؤالاً..."
                            />
                          </div>
                          
                          <div className="space-y-4">
                            {scene.content.options.map((option, idx) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-4">
                                  <div className="text-2xl">{idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D'}</div>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => {
                                        const newOptions = [...scene.content.options];
                                        newOptions[idx].text = e.target.value;
                                        updateScene(scene.id, {
                                          content: { ...scene.content, options: newOptions }
                                        });
                                      }}
                                      className="w-full bg-transparent border-none outline-none text-white"
                                      placeholder={`الخيار ${idx + 1}`}
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newOptions = scene.content.options.filter((_, i) => i !== idx);
                                      updateScene(scene.id, {
                                        content: { ...scene.content, options: newOptions }
                                      });
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <IconTrash size={20} />
                                  </button>
                                </div>
                                
                                <div className="mt-3">
                                  <label className="text-sm text-white/50">المشهد التالي:</label>
                                  <select
                                    value={option.nextScene || ''}
                                    onChange={(e) => {
                                      const newOptions = [...scene.content.options];
                                      newOptions[idx].nextScene = e.target.value || null;
                                      updateScene(scene.id, {
                                        content: { ...scene.content, options: newOptions }
                                      });
                                    }}
                                    className="w-full mt-1 bg-black/50 border border-white/20 rounded p-2 text-sm text-white"
                                  >
                                    <option value="">نهاية السيناريو</option>
                                    {scenes
                                      .filter(s => s.id !== scene.id)
                                      .map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                      ))}
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => {
                              const newOptions = [...scene.content.options, { text: '', nextScene: null }];
                              updateScene(scene.id, {
                                content: { ...scene.content, options: newOptions }
                              });
                            }}
                            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center gap-2"
                          >
                            <IconPlus size={20} />
                            إضافة خيار جديد
                          </button>
                        </div>
                      );

                    default:
                      return (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">
                            {SCENARIO_ELEMENTS.find(e => e.type === scene.type)?.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{scene.type}</h3>
                          <p className="text-white/50">محرر هذا النوع قيد التطوير</p>
                        </div>
                      );
                  }
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <IconScript size={120} className="text-purple-500/30 mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">محرر السيناريوهات</h3>
                <p className="text-white/50 mb-6">ابدأ بإنشاء مشهد جديد من شريط الأدوات</p>
                <div className="grid grid-cols-4 gap-4 max-w-2xl">
                  {SCENARIO_ELEMENTS.map(element => (
                    <button
                      key={element.type}
                      onClick={() => addScene(element.type)}
                      className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                      style={{ borderLeft: `4px solid ${element.color}` }}
                    >
                      <div className="text-2xl mb-2">{element.icon}</div>
                      <div className="font-bold text-white">{element.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* خصائص المشهد */}
          {selectedScene && !previewMode && (
            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h3 className="font-bold text-white mb-4">خصائص المشهد</h3>
              
              {(() => {
                const scene = scenes.find(s => s.id === selectedScene);
                if (!scene) return null;

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 mb-2">اسم المشهد</label>
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                        className="w-full bg-black border border-white/20 rounded-lg p-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">نوع المشهد</label>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {SCENARIO_ELEMENTS.find(e => e.type === scene.type)?.icon}
                          </span>
                          <span className="font-bold">{SCENARIO_ELEMENTS.find(e => e.type === scene.type)?.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">المتغيرات</label>
                      <div className="space-y-2">
                        {Object.entries(variables).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-white/5 rounded">
                            <span className="text-sm text-cyan-400">{key}</span>
                            <span className="text-sm text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const varName = prompt('اسم المتغير:');
                          if (varName) {
                            setVariables({ ...variables, [varName]: '' });
                          }
                        }}
                        className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 rounded text-sm"
                      >
                        + إضافة متغير
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">الإجراءات</label>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const newScene = {
                              id: Date.now(),
                              type: 'dialogue',
                              title: `مشهد ${scenes.length + 1}`,
                              content: getDefaultContent('dialogue'),
                              position: { x: 0, y: 0 }
                            };
                            setScenes([...scenes, newScene]);
                          }}
                          className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm"
                        >
                          + إضافة مشهد بعده
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(scene))}
                          className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded text-sm"
                        >
                          نسخ المشهد
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}