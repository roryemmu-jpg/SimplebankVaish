import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageStream, resetChat } from './services/geminiService';
import { db } from './services/db';
import { Message, Role, ChatState, UserAccount, Transaction } from './types';
import { ChatBubble } from './components/ChatBubble';
import { InputArea } from './components/InputArea';
import { BankLogin } from './components/BankLogin';
import { TransactionHistory } from './components/TransactionHistory';
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  // Chat State
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Banking State
  const [user, setUser] = useState<UserAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amountInput, setAmountInput] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Banking Handlers
  const handleLogin = (name: string, userId: string) => {
    // Check DB for existing user
    const existingUser = db.getUser(userId);

    if (existingUser) {
      // Load existing data
      setUser(existingUser);
      setTransactions(db.getTransactions(userId));

      // Welcome back message
      const greeting: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        content: `Welcome back, ${existingUser.name}! I've retrieved your account details. Your current balance is $${existingUser.balance.toFixed(2)}. How can I assist you today?`,
        timestamp: Date.now(),
      };
      setChatState(prev => ({ ...prev, messages: [greeting] }));
    } else {
      // Create new user
      const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const newUser: UserAccount = {
        name,
        userId,
        accountNumber,
        balance: 1000, // Sign up bonus
      };
      
      // Save to DB
      db.createUser(newUser);
      setUser(newUser);
      
      // Add initial deposit transaction
      const initialTx: Transaction = {
        id: uuidv4(),
        type: 'deposit',
        amount: 1000,
        date: Date.now(),
        description: 'Opening Bonus'
      };
      
      // Save Tx to DB
      db.addTransaction(userId, initialTx);
      setTransactions([initialTx]);

      // Initial Chat Greeting
      const greeting: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        content: `Hello ${name}! Welcome to Simple Bank. I've opened a new account (#${accountNumber}) for you with a $1,000 signing bonus. How can I help you today?`,
        timestamp: Date.now(),
      };
      setChatState(prev => ({ ...prev, messages: [greeting] }));
    }
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    if (activeTab === 'withdraw' && amount > user.balance) {
      alert("Insufficient funds.");
      return;
    }

    const newBalance = activeTab === 'deposit' ? user.balance + amount : user.balance - amount;
    
    const newTx: Transaction = {
      id: uuidv4(),
      type: activeTab,
      amount: amount,
      date: Date.now(),
      description: activeTab === 'deposit' ? 'Cash Deposit' : 'Cash Withdrawal'
    };

    // Update State
    setUser({ ...user, balance: newBalance });
    setTransactions(prev => [...prev, newTx]);
    setAmountInput('');

    // Update DB
    db.updateUserBalance(user.userId, newBalance);
    db.addTransaction(user.userId, newTx);
  };

  // Chat Handlers
  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      content: text,
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    const modelMessageId = uuidv4();
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: Role.MODEL,
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, initialModelMessage],
    }));

    try {
      let fullResponseText = '';
      await sendMessageStream(text, (chunk) => {
        fullResponseText += chunk;
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === modelMessageId ? { ...msg, content: fullResponseText } : msg
          ),
        }));
      });

      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        messages: prev.messages.map((msg) =>
          msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg
        ),
      }));

    } catch (error) {
      console.error("Failed to send message", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Connection issue. Please try again.",
        messages: prev.messages.filter(msg => msg.id !== modelMessageId)
      }));
    }
  };

  const handleReset = () => {
    if(window.confirm("Are you sure you want to log out?")) {
      resetChat();
      setUser(null);
      setChatState({ messages: [], isLoading: false, error: null });
    }
  };

  if (!user) {
    return <BankLogin onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* LEFT PANEL: BANK DASHBOARD */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-925 relative z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-950/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
             </div>
             <div>
               <h1 className="font-bold text-xl tracking-tight text-white">{APP_TITLE}</h1>
               <span className="text-xs text-slate-500 font-medium">System Online</span>
             </div>
          </div>
          <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white transition-colors">
            Log Out
          </button>
        </div>

        <div className="p-6 space-y-8 flex-grow">
          {/* Card Component */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-8">
               <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
                  <h2 className="text-4xl font-bold text-white tracking-tight">
                    ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
               </div>
               <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                 </svg>
               </div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Account Holder</p>
                   <p className="font-medium text-slate-100">{user.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Account Number</p>
                   <p className="font-mono text-slate-100 tracking-wider">**** {user.accountNumber.slice(-4)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div>
            <div className="flex bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
               <button 
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'deposit' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Deposit
               </button>
               <button 
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'withdraw' ? 'bg-slate-800 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Withdraw
               </button>
            </div>

            <form onSubmit={handleTransaction} className="flex gap-2">
               <div className="relative flex-grow">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                 <input 
                    type="number" 
                    min="0.01" 
                    step="0.01"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                 />
               </div>
               <button 
                 type="submit"
                 className={`px-6 rounded-xl font-medium transition-all active:scale-95 ${
                   activeTab === 'deposit' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                 }`}
               >
                 {activeTab === 'deposit' ? 'Add Funds' : 'Withdraw'}
               </button>
            </form>
          </div>

          {/* Transaction List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Activity</h3>
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        {/* Footer Credits */}
        <div className="p-4 border-t border-slate-800 text-center bg-slate-950/50 text-xs text-slate-500">
          <p className="font-medium text-slate-400">Created by Project Team</p>
          <p className="mt-1">S Emmanuel • P Vaishnavi • Rishika Sagar • Syed Abrar</p>
        </div>
      </div>

      {/* RIGHT PANEL: AI ASSISTANT */}
      <div className="w-full lg:w-1/2 flex flex-col h-[600px] lg:h-auto relative bg-slate-950">
        <div className="flex-none h-16 border-b border-slate-800 flex items-center px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
           <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
           <h2 className="text-sm font-semibold text-slate-200">Bank Support Agent</h2>
        </div>

        <main className="flex-grow overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-xl mx-auto">
            {chatState.messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {chatState.error && (
              <div className="bg-rose-900/20 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl mb-4 text-sm text-center">
                {chatState.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <InputArea onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />
      </div>

    </div>
  );
};

export default App;