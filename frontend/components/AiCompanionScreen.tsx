

import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { AIChatMessage, User } from '../types';
import { startChat, sendMessage } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface AiCompanionScreenProps {
    currentUser: User;
}

const AiCompanionScreen: React.FC<AiCompanionScreenProps> = ({ currentUser }) => {
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                const chat = await startChat();
                if (chat) {
                    chatRef.current = chat;
                    setMessages([{
                        id: 'initial',
                        role: 'model',
                        text: "Hello! I'm your AI Study Companion. How can I help you prepare for your exams today? You can ask me to explain a concept, summarize a topic, or even create a practice quiz!",
                        timestamp: new Date()
                    }]);
                } else {
                    setError("Could not initialize AI Companion. The API key might be missing.");
                }
            } catch (e) {
                console.error("Chat initialization error:", e);
                setError("An error occurred while starting the AI Companion.");
            }
        };

        initChat();
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (prompt?: string) => {
        const textToSend = prompt || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: AIChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            if (!chatRef.current) {
                 throw new Error("Chat is not initialized.");
            }
            const responseText = await sendMessage(chatRef.current, textToSend);
            const modelMessage: AIChatMessage = {
                id: `model-${Date.now()}`,
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            console.error(e);
            const errorMessage: AIChatMessage = {
                id: `error-${Date.now()}`,
                role: 'model',
                text: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
             setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const suggestedPrompts = [
        "Explain the Krebs cycle in simple terms",
        "Summarize the main causes of World War I",
        "Create a 5-question multiple choice quiz on photosynthesis",
        "What's the difference between Python lists and tuples?"
    ];

    return (
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 max-h-screen">
            {/* Header */}
            <div className="flex items-center h-16 p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
                <SparklesIcon className="w-8 h-8 mr-3 text-indigo-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Study Companion</h1>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <SparklesIcon className="w-8 h-8 text-indigo-400 flex-shrink-0" />}
                        <div className={`max-w-xl p-3 rounded-lg shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full flex-shrink-0"/>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <SparklesIcon className="w-8 h-8 text-indigo-400 flex-shrink-0 animate-pulse" />
                        <div className="max-w-xl p-3 rounded-lg shadow bg-white dark:bg-gray-700">
                           <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                           </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested Prompts */}
            {messages.length <= 1 && (
                 <div className="p-4 flex-shrink-0">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         {suggestedPrompts.map(prompt => (
                             <button 
                                key={prompt}
                                onClick={() => handleSendMessage(prompt)}
                                className="p-3 bg-gray-200 dark:bg-gray-800 text-left rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                             >
                                 {prompt}
                             </button>
                         ))}
                     </div>
                 </div>
            )}

            {/* Input Bar */}
            <div className="flex-shrink-0 p-3 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                     <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything about your studies..."
                        className="flex-1 p-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        className="p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
                        disabled={isLoading || !input.trim()}
                    >
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiCompanionScreen;