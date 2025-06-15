import React, { useState } from 'react';

interface NewsletterProps {
  variant?: 'default' | 'hero' | 'inline' | 'modal';
  onSubscribe?: (email: string, firstName?: string) => void;
}

export const Newsletter: React.FC<NewsletterProps> = ({ 
  variant = 'default',
  onSubscribe 
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Email wajib diisi');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Format email tidak valid');
      return;
    }

    setIsSubscribing(true);
    setErrorMessage('');

    try {
      // Call Brevo API endpoint with firstName for personalized welcome email
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          firstName: firstName.trim(),
          source: variant
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubscriptionStatus('success');
        setEmail('');
        setFirstName('');
        
        // Callback for parent component
        if (onSubscribe) {
          onSubscribe(email, firstName);
        }

        // Reset status after 8 seconds
        setTimeout(() => setSubscriptionStatus('idle'), 8000);
      } else {
        setSubscriptionStatus('error');
        setErrorMessage(result.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
      
    } catch (error) {
      setSubscriptionStatus('error');
      setErrorMessage('Terjadi kesalahan koneksi. Silakan coba lagi.');
      console.error('Newsletter subscription error:', error);
    }

    setIsSubscribing(false);
  };

  // Hero variant for main landing areas
  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Newsletter Islamic Roadmap
            </h2>
            <p className="text-xl text-blue-100 mb-6 leading-relaxed">
              Dapatkan panduan pembelajaran Islam mingguan, tips studi efektif, dan update konten terbaru langsung di inbox Anda
            </p>
          </div>

          {subscriptionStatus === 'success' ? (
            <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-3xl mr-3">🎉</span>
                <h3 className="text-xl font-semibold">Berhasil Berlangganan!</h3>
              </div>
              <p className="text-green-100 mb-2">
                Jazakallahu khairan telah bergabung dengan Islamic Roadmap Newsletter!
              </p>
              <p className="text-green-200 text-sm">
                📧 Cek email Anda untuk pesan selamat datang dalam beberapa menit
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-lg mx-auto">
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nama depan (opsional)"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                  disabled={isSubscribing}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda..."
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                  disabled={isSubscribing}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full px-6 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubscribing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Berlangganan...
                  </div>
                ) : (
                  '📧 Berlangganan Newsletter Gratis'
                )}
              </button>
              
              {errorMessage && (
                <p className="text-red-200 text-sm mt-3 text-center">{errorMessage}</p>
              )}
              
              <div className="mt-4 text-blue-200 text-sm text-center">
                <p>✓ Gratis selamanya • ✓ Welcome email otomatis • ✓ Bisa unsubscribe kapan saja</p>
              </div>
            </form>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold mb-1">Konten Berkualitas</h4>
              <p className="text-sm text-blue-200">Panduan pembelajaran yang telah dikurasi ahli</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📧</div>
              <h4 className="font-semibold mb-1">Welcome Email</h4>
              <p className="text-sm text-blue-200">Email selamat datang otomatis dengan panduan lengkap</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1">Tips Praktis</h4>
              <p className="text-sm text-blue-200">Strategi belajar yang mudah diterapkan</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant for embedding in content
  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📧</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Dapatkan Update Mingguan
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Tips pembelajaran Islam, konten baru, dan panduan studi efektif setiap minggu
            </p>
            
            {subscriptionStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-green-800 text-sm">
                  <p className="font-medium">✅ Berhasil berlangganan!</p>
                  <p className="mt-1">📧 Cek email untuk pesan selamat datang</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nama (opsional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isSubscribing}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Anda"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isSubscribing}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isSubscribing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Berlangganan...
                    </div>
                  ) : (
                    '📧 Berlangganan'
                  )}
                </button>
                {errorMessage && (
                  <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 text-xl">📧</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Newsletter Islamic Roadmap
        </h3>
        <p className="text-gray-600 text-sm">
          Dapatkan tips pembelajaran Islam dan update konten terbaru
        </p>
      </div>

      {subscriptionStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-green-800">
            <p className="font-medium mb-1">🎉 Berhasil berlangganan!</p>
            <p className="text-sm">📧 Cek email untuk pesan selamat datang</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nama depan (opsional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubscribing}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubscribing}
            required
          />
          <button
            type="submit"
            disabled={isSubscribing}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubscribing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Berlangganan...
              </div>
            ) : (
              '📧 Berlangganan Newsletter'
            )}
          </button>
          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}
          <p className="text-gray-500 text-xs text-center">
            Gratis selamanya • Welcome email otomatis • Bisa unsubscribe kapan saja
          </p>
        </form>
      )}
    </div>
  );
}; 