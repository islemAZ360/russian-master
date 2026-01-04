"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';
import GlobalLiveManager from '../features/live/GlobalLiveManager';

/**
 * التخطيط المركزي (CyberLayout)
 * تم إصلاحه لضمان عمل التمرير (Scrolling) بشكل احترافي في كافة أنحاء النظام
 */
export default function CyberLayout({ children }) {
  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-[var(--text-main)] bg-[#050505]">
      
      {/* 1. الخلفية الكونية (ثابتة في الخلفية) */}
      <div className="fixed inset-0 z-0">
        <CosmicBackground />
      </div>
      
      {/* 2. مدير البث المباشر (طبقة علوية ثابتة) */}
      <GlobalLiveManager />
      
      {/* 
          3. المحتوى الرئيسي (Main Scrollable Area):
          - h-full: يشغل كامل ارتفاع الشاشة.
          - overflow-y-auto: يسمح بالتمرير العمودي للمحتوى الذي يتجاوز الشاشة.
          - custom-scrollbar: كلاس مخصص لتحسين شكل شريط التمرير.
      */}
      <main className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar scroll-smooth">
          
          {/* حاوية وسطية لتوسيط المحتوى ومنع التشتت */}
          <div className="w-full max-w-7xl mx-auto flex flex-col min-h-full px-4 md:px-8 pt-20 md:pt-24">
            
            {/* عرض المحتوى القادم من الراوتر أو المكونات */}
            <div className="flex-1 flex flex-col">
                {children}
            </div>

            {/* 
                فاصل سفلي (Bottom Spacer): 
                مهم جداً لمنع تداخل المحتوى مع شريط التنقل السفلي (Floating Dock)
            */}
            <div className="h-32 md:h-20 shrink-0 pointer-events-none" />
          </div>
      </main>

      {/* الستايلات الخاصة بشريط التمرير السايبيربانك */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2); /* لون سيان شفاف */
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5); /* لون سيان أوضح عند التحويم */
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        /* تحسين تجربة التمرير في المتصفحات الأخرى */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.2) rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}