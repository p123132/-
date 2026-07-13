import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface DiceResult {
  value: number;
  isEven: boolean;
}

interface NumberResult {
  value: number;
  isEven: boolean;
}

export default function DecisionPage() {
  const [mode, setMode] = useState<'dice' | 'number'>('dice');
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [numberResult, setNumberResult] = useState<NumberResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [diceTransform, setDiceTransform] = useState('rotateX(0deg) rotateY(0deg)');
  const [countdown, setCountdown] = useState<number | null>(null);
  const router = useRouter();

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setShowResult(false);
    setDiceResult(null);
    
    const randomX = Math.floor(Math.random() * 4) * 360 + (Math.random() > 0.5 ? 90 : 270);
    const randomY = Math.floor(Math.random() * 4) * 360 + (Math.random() > 0.5 ? 90 : 270);
    
    setDiceTransform(`rotateX(${randomX}deg) rotateY(${randomY}deg)`);
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult({ value: result, isEven: result % 2 === 0 });
      setShowResult(true);
      setIsRolling(false);
    }, 1500);
  };

  const pickNumber = () => {
    if (isRolling) return;
    setIsRolling(true);
    setShowResult(false);
    setNumberResult(null);
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          const result = Math.floor(Math.random() * 10) + 1;
          setNumberResult({ value: result, isEven: result % 2 === 0 });
          setShowResult(true);
          setIsRolling(false);
          return null;
        }
        return prev! - 1;
      });
    }, 200);
  };

  const handleGoToTodos = () => {
    router.push('/todos');
  };

  const handleRetry = () => {
    setShowResult(false);
    setDiceResult(null);
    setNumberResult(null);
    setDiceTransform('rotateX(0deg) rotateY(0deg)');
  };

  const getResultMessage = (isEven: boolean) => {
    return isEven 
      ? { title: '命运召唤！', desc: '是时候行动了，快去完成你的待办事项！', color: 'from-green-400 to-emerald-500', icon: 'check' }
      : { title: '休息一下', desc: '今天先放松一下，明天再继续努力！', color: 'from-orange-400 to-red-500', icon: 'coffee' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial"></div>
      
      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-gradient">命运抉择</span>
          </h1>
          <p className="text-white/70 text-lg">选择一种方式，让命运决定你的下一步</p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => { setMode('dice'); setShowResult(false); }}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              mode === 'dice' 
                ? 'bg-white text-purple-700 shadow-lg scale-105' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            🎲 摇骰子
          </button>
          <button
            onClick={() => { setMode('number'); setShowResult(false); }}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              mode === 'number' 
                ? 'bg-white text-purple-700 shadow-lg scale-105' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            🔢 选数字
          </button>
        </div>

        {!showResult ? (
          <div className="flex flex-col items-center">
            {mode === 'dice' ? (
              <div className="dice-container mb-10">
                <div 
                  className="dice" 
                  style={{ transform: diceTransform }}
                >
                  <div className="dice-face front face-1">
                    <div className="dice-dot"></div>
                  </div>
                  <div className="dice-face back face-2">
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                  </div>
                  <div className="dice-face right face-3">
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                  </div>
                  <div className="dice-face left face-4">
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                  </div>
                  <div className="dice-face top face-5">
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                  </div>
                  <div className="dice-face bottom face-6">
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                    <div className="dice-dot"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-10">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 border-2 border-white/10 rounded-full"></div>
                  <div className={`text-8xl font-bold transition-all duration-200 ${countdown !== null ? 'text-white scale-110' : 'text-white/70'}`}>
                    {countdown ?? '?'}
                  </div>
                </div>
                <p className="text-white/50 text-center mt-4">数字范围: 1-10</p>
              </div>
            )}

            <button
              onClick={mode === 'dice' ? rollDice : pickNumber}
              disabled={isRolling}
              className={`px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-2 ${
                isRolling 
                  ? 'bg-white/30 text-white/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-1'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isRolling ? (
                  <circle cx="12" cy="12" r="10" className="animate-spin"/>
                ) : (
                  <path d="M12 5v14M5 12h14"/>
                )}
              </svg>
              {isRolling ? '转动中...' : (mode === 'dice' ? '摇骰子' : '选数字')}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getResultMessage(mode === 'dice' ? diceResult!.isEven : numberResult!.isEven).color} mb-8 animate-bounce-in shadow-lg`}>
              <span className="text-6xl font-bold text-white">
                {mode === 'dice' ? diceResult!.value : numberResult!.value}
              </span>
            </div>
            
            <div className="glass-effect rounded-2xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {getResultMessage(mode === 'dice' ? diceResult!.isEven : numberResult!.isEven).title}
              </h2>
              <p className="text-white/80 text-lg mb-6">
                {getResultMessage(mode === 'dice' ? diceResult!.isEven : numberResult!.isEven).desc}
              </p>
              <div className="flex justify-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  (mode === 'dice' ? diceResult!.isEven : numberResult!.isEven)
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {(mode === 'dice' ? diceResult!.isEven : numberResult!.isEven) ? '偶数 - 去做' : '奇数 - 休息'}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all"
              >
                再试一次
              </button>
              {(mode === 'dice' ? diceResult!.isEven : numberResult!.isEven) && (
                <button
                  onClick={handleGoToTodos}
                  className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <polyline points="9 5 9 12 15 12"/>
                  </svg>
                  去完成待办
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}