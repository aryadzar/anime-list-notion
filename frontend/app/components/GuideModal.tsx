interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMock: boolean;
}

export function GuideModal({ isOpen, onClose, isMock }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md anim-backdrop flex items-center justify-center p-4">
      <div className="bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl max-w-lg w-full p-6 shadow-2xl relative anim-modal-spring">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white p-1 rounded hover:bg-[#282828] transition"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 text-neutral-100 font-semibold text-lg mb-2">
          <span>🚀</span>
          <h2>Panduan Menghubungkan ke Notion Database</h2>
        </div>

        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          Saat ini aplikasi menggunakan {isMock ? (
            <span className="text-amber-300 font-medium">mode Mockup Data</span>
          ) : (
            <span className="text-emerald-300 font-medium">Notion Live Connection</span>
          )}. Ikuti langkah mudah ini untuk menghubungkan langsung ke database Notion Anda:
        </p>

        <ol className="space-y-3 text-xs text-neutral-300 list-decimal list-inside">
          <li className="bg-[#141414] p-3 rounded-lg border border-[#262626]">
            <strong className="text-white">Buat Notion Integration:</strong>
            <p className="text-neutral-400 mt-1 pl-4">
              Buka{" "}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                notion.so/my-integrations
              </a>
              , buat integrasi baru bernama misalnya "Anime Tracker", lalu salin <code>Internal Integration Secret</code>.
            </p>
          </li>

          <li className="bg-[#141414] p-3 rounded-lg border border-[#262626]">
            <strong className="text-white">Beri Akses ke Database Notion:</strong>
            <p className="text-neutral-400 mt-1 pl-4">
              Buka database Manhwa/Anime Anda di Notion. Klik tombol <code>•••</code> di pojok kanan atas &gt; pilih <code>Connect to</code> (atau <code>Connections</code>) &gt; pilih integrasi yang telah Anda buat.
            </p>
          </li>

          <li className="bg-[#141414] p-3 rounded-lg border border-[#262626]">
            <strong className="text-white">Salin Database ID:</strong>
            <p className="text-neutral-400 mt-1 pl-4">
              URL database Notion Anda berbentuk:
              <br />
              <code className="text-emerald-400 block mt-1 break-all bg-black/40 p-1 rounded text-[11px]">
                https://www.notion.so/[workspace]/[DATABASE_ID]?v=...
              </code>
              Salin 32 karakter kode sebelum tanda tanya <code>?v=...</code>.
            </p>
          </li>

          <li className="bg-[#141414] p-3 rounded-lg border border-[#262626]">
            <strong className="text-white">Isi di file backend/.env:</strong>
            <pre className="mt-1 bg-black/50 p-2 rounded text-[11px] font-mono text-neutral-300 overflow-x-auto">
{`NOTION_API_KEY=ntn_xxxx (atau secret_xxxx)
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
            </pre>
          </li>
        </ol>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-white text-black font-semibold text-xs rounded-md transition shadow"
          >
            Mengerti, Siap Sambungkan
          </button>
        </div>
      </div>
    </div>
  );
}
