import { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';
import InterviewSimulator from '../components/InterviewSimulator';
import JobMatcher from '../components/JobMatcher';
import CoverLetterGen from '../components/CoverLetterGen';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('resume');

  const tabs = [
    { id: 'resume', label: '📄 Анализ резюме' },
    { id: 'interview', label: '💼 Собеседование' },
    { id: 'jobs', label: '🔍 Поиск вакансий' },
    { id: 'letter', label: '✉️ Сопроводительное письмо' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Табы */}
      <div className="flex flex-wrap space-x-2 mb-8 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'resume' && <ResumeUpload />}
        {activeTab === 'interview' && <InterviewSimulator />}
        {activeTab === 'jobs' && <JobMatcher />}
        {activeTab === 'letter' && <CoverLetterGen />}
      </div>
    </div>
  );
}

export default Dashboard;