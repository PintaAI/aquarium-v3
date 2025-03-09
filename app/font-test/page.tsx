import React from 'react';

export default function FontTestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Font Test Page</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl">Atma Font (Latin characters)</h2>
        <p className="text-xl">This text should use Atma font for Latin characters.</p>
        <p className="text-xl">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
        <p className="text-xl">abcdefghijklmnopqrstuvwxyz</p>
        <p className="text-xl">1234567890</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Jua Font (Hangeul characters)</h2>
        <p className="text-xl korean">이 텍스트는 주아 폰트를 사용해야 합니다.</p>
        <p className="text-xl korean">한글 예시: 안녕하세요, 반갑습니다.</p>
        <p className="text-xl korean">가나다라마바사아자차카타파하</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Mixed Content</h2>
        <p className="text-xl">
          This sentence has both Latin characters and 한글 characters mixed together.
        </p>
        <p className="text-xl">
          안녕하세요! Hello! 반갑습니다! Nice to meet you!
        </p>
      </section>
    </div>
  );
}
