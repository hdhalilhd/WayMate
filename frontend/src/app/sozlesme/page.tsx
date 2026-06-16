import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Kullanıcı Sözleşmesi — WayMate" };

export default function SozlesmePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/kayit" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600">
            <ArrowLeft className="w-4 h-4" /> Geri dön
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">WayMate Kullanıcı Sözleşmesi</h1>
          <p className="text-sm text-gray-400 mb-6">Son güncelleme: 2026 · <span className="text-amber-600">Temsili metin — yasal metin daha sonra yüklenecektir.</span></p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-5 text-sm leading-relaxed">
            <section>
              <h2 className="font-bold text-gray-900">1. Taraflar ve Kapsam</h2>
              <p>İşbu sözleşme, WayMate platformunu ("Platform") kullanan üye ("Kullanıcı") ile Platform işletmecisi arasında düzenlenmiştir. Platforma kayıt olan her kullanıcı bu sözleşmeyi kabul etmiş sayılır.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">2. Hizmetin Niteliği</h2>
              <p>WayMate, aynı güzergahı kullanan kişileri bir araya getiren bir <b>eşleştirme ve iletişim platformudur</b>. Platform bir taşımacılık şirketi değildir; kullanıcılar arasındaki yolculuk anlaşmaları tamamen kullanıcıların kendi sorumluluğundadır. WayMate, kullanıcılar arasındaki anlaşmalara taraf değildir.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">3. Kullanıcı Yükümlülükleri</h2>
              <p>Kullanıcı; verdiği bilgilerin doğru olduğunu, yürürlükteki mevzuata uygun davranacağını, diğer kullanıcıların haklarına saygı göstereceğini ve Platformu kötüye kullanmayacağını kabul eder. Sürücü kullanıcılar, geçerli ehliyet ve zorunlu sigortalara sahip olmakla yükümlüdür.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">4. Ücret Paylaşımı</h2>
              <p>Platform üzerinden belirtilen ücretler, yakıt ve yol masraflarının paylaşımına yöneliktir ve ticari taşımacılık ücreti niteliği taşımaz. WayMate bu ödemelere aracılık etmez.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">5. Kişisel Verilerin Korunması (KVKK)</h2>
              <p>Kullanıcı verileri 6698 sayılı KVKK kapsamında işlenir. E-posta ve TC kimlik doğrulaması güvenlik amacıyla yapılır; TC kimlik numarası sistemde saklanmaz, yalnızca doğrulama sonucu tutulur. İletişim bilgileri, kullanıcı onayı olmadan üçüncü kişilerle paylaşılmaz.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">6. Güvenlik ve Sorumluluk</h2>
              <p>WayMate, kullanıcılar arasındaki yolculuklar sırasında doğabilecek zararlardan sorumlu tutulamaz. Kullanıcılar, yolculuk öncesi karşı tarafın profil doğrulamalarını kontrol etmeli ve güvenlik önlemlerini almalıdır. Şüpheli durumlar "Şikayet Et" özelliğiyle bildirilebilir.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">7. Hesabın Askıya Alınması</h2>
              <p>Sözleşmeye veya mevzuata aykırı davranan, hakkında haklı şikayet bulunan kullanıcıların hesapları uyarısız askıya alınabilir veya kapatılabilir.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900">8. Değişiklikler</h2>
              <p>WayMate, işbu sözleşmeyi güncelleme hakkını saklı tutar. Güncel sözleşme Platform üzerinde yayımlandığı anda yürürlüğe girer.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
