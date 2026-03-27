'use client';

import { useState, useEffect, useRef } from 'react';

interface MessageBubble {
  uid: string;
  from: 'assistant' | 'user';
  text: string;
  createdAt: Date;
  messageStyle?: 'standard' | 'inquiry' | 'notification';
}

interface InputPrompt {
  uid: string;
  promptText: string;
  inputMode: 'shortText' | 'longText' | 'singleSelect' | 'multiSelect';
  options?: string[];
  hint?: string;
}

export default function WorkspacePage() {
  const [messageList, setMessageList] = useState<MessageBubble[]>([
    {
      uid: `asst-initial`,
      from: 'assistant',
      text: 'Welcome! 👋 This is your interactive communication space. I\'ll guide you through tasks using visual elements instead of terminal commands. What would you like to explore?',
      createdAt: new Date(),
      messageStyle: 'notification',
    }
  ]);
  const [currentPrompt, setCurrentPrompt] = useState<InputPrompt | null>(null);
  const [textValue, setTextValue] = useState<string>('');
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList, currentPrompt]);

  const appendAssistantMessage = (content: string, style: 'standard' | 'inquiry' | 'notification' = 'standard') => {
    const msg: MessageBubble = {
      uid: `asst-${Date.now()}-${Math.random()}`,
      from: 'assistant',
      text: content,
      createdAt: new Date(),
      messageStyle: style,
    };
    setMessageList(prev => [...prev, msg]);
  };

  const appendUserMessage = (content: string) => {
    const msg: MessageBubble = {
      uid: `usr-${Date.now()}-${Math.random()}`,
      from: 'user',
      text: content,
      createdAt: new Date(),
      messageStyle: 'standard',
    };
    setMessageList(prev => [...prev, msg]);
  };

  const showInputPrompt = (prompt: InputPrompt) => {
    setCurrentPrompt(prompt);
    setTextValue('');
    setCheckedOptions([]);
  };

  const submitAnswer = () => {
    if (currentPrompt) {
      let answer = '';
      if (currentPrompt.inputMode === 'singleSelect') {
        answer = textValue;
      } else if (currentPrompt.inputMode === 'multiSelect') {
        answer = checkedOptions.join(', ');
      } else {
        answer = textValue;
      }

      if (answer.trim()) {
        appendUserMessage(answer);
        setCurrentPrompt(null);
        setTextValue('');
        setCheckedOptions([]);
        
        setTimeout(() => {
          appendAssistantMessage('Got it! Let me process that...', 'notification');
        }, 600);
      }
    }
  };

  const toggleOption = (option: string) => {
    if (currentPrompt?.inputMode === 'singleSelect') {
      setTextValue(option);
    } else if (currentPrompt?.inputMode === 'multiSelect') {
      setCheckedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(opt => opt !== option)
          : [...prev, option]
      );
    }
  };

  const launchDemo = () => {
    appendAssistantMessage('Here\'s a sample question for you...', 'standard');
    setTimeout(() => {
      showInputPrompt({
        uid: 'sample-prompt-1',
        promptText: 'Which task interests you most?',
        inputMode: 'singleSelect',
        options: [
          'Catalog my wardrobe items',
          'Create outfit combinations',
          'Organize by categories',
          'Learn about the features'
        ],
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navigation */}
      <header className="bg-primary text-on-primary px-6 py-4 shadow-elevation-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-on-primary text-primary rounded-full flex items-center justify-center text-xl font-bold">
              AI
            </div>
            <div>
              <h1 className="text-title-large font-semibold">Interactive Workspace</h1>
              <p className="text-label-small opacity-90">Visual AI Communication Hub</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-on-primary text-primary rounded-full text-label-medium hover:opacity-90 transition-opacity"
          >
            Return Home
          </button>
        </div>
      </header>

      {/* Message Thread */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messageList.map(msg => (
            <div
              key={msg.uid}
              className={`flex ${msg.from === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-5 py-3 shadow-elevation-1 ${
                  msg.from === 'assistant'
                    ? msg.messageStyle === 'notification'
                      ? 'bg-tertiary-container text-on-tertiary-container'
                      : 'bg-secondary-container text-on-secondary-container'
                    : 'bg-primary text-on-primary'
                }`}
              >
                <p className="text-body-large whitespace-pre-wrap">{msg.text}</p>
                <p className="text-label-small opacity-70 mt-2">
                  {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Question Interface */}
          {currentPrompt && (
            <div className="bg-surface-container rounded-3xl p-6 shadow-elevation-3 border-2 border-primary animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  ?
                </div>
                <h2 className="text-headline-small text-on-surface flex-1">{currentPrompt.promptText}</h2>
              </div>

              {/* Text Fields */}
              {(currentPrompt.inputMode === 'shortText' || currentPrompt.inputMode === 'longText') && (
                <div className="mb-4">
                  {currentPrompt.inputMode === 'shortText' ? (
                    <input
                      type="text"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                      placeholder={currentPrompt.hint || 'Enter your response...'}
                      className="w-full px-4 py-3 bg-surface border-2 border-outline rounded-2xl text-body-large text-on-surface focus:border-primary focus:outline-none transition-colors"
                      autoFocus
                    />
                  ) : (
                    <textarea
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder={currentPrompt.hint || 'Enter your response...'}
                      rows={4}
                      className="w-full px-4 py-3 bg-surface border-2 border-outline rounded-2xl text-body-large text-on-surface focus:border-primary focus:outline-none transition-colors resize-none"
                      autoFocus
                    />
                  )}
                </div>
              )}

              {/* Selection Options */}
              {(currentPrompt.inputMode === 'singleSelect' || currentPrompt.inputMode === 'multiSelect') && (
                <div className="space-y-3 mb-4">
                  {currentPrompt.options?.map((opt) => {
                    const isChosen = currentPrompt.inputMode === 'singleSelect' 
                      ? textValue === opt 
                      : checkedOptions.includes(opt);
                    
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleOption(opt)}
                        className={`w-full px-5 py-4 rounded-2xl text-left text-body-large transition-all ${
                          isChosen
                            ? 'bg-primary text-on-primary shadow-elevation-2 scale-[1.02]'
                            : 'bg-surface border-2 border-outline text-on-surface hover:border-primary hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isChosen ? 'border-on-primary bg-on-primary' : 'border-outline'
                          }`}>
                            {isChosen && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Confirmation Button */}
              <button
                onClick={submitAnswer}
                disabled={
                  (currentPrompt.inputMode === 'shortText' || currentPrompt.inputMode === 'longText') && !textValue.trim() ||
                  (currentPrompt.inputMode === 'singleSelect') && !textValue ||
                  (currentPrompt.inputMode === 'multiSelect') && checkedOptions.length === 0
                }
                className="w-full px-6 py-4 bg-primary text-on-primary rounded-full text-label-large font-semibold shadow-elevation-1 hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Confirm Response
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Action Bar */}
      {!currentPrompt && (
        <div className="bg-surface-container border-t border-outline px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={launchDemo}
              className="w-full px-6 py-3 bg-secondary-container text-on-secondary-container rounded-full text-label-large font-medium hover:shadow-elevation-2 transition-all"
            >
              📋 Try Interactive Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
