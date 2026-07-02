import { Images, Video, FolderOpen, Users, Star, FileText } from "lucide-react";

interface Props {
  galleries: number;
  photos: number;
  videos: number;
  clients: number;
  favorites: number;
  documents: number;
}

const stats = (p: Props) => [
  { label: "Galeries", value: p.galleries, icon: FolderOpen, color: "text-wem-red" },
  { label: "Photos", value: p.photos, icon: Images, color: "text-blue-500" },
  { label: "Vidéos", value: p.videos, icon: Video, color: "text-purple-500" },
  { label: "Documents", value: p.documents, icon: FileText, color: "text-orange-400" },
  { label: "Clients", value: p.clients, icon: Users, color: "text-green-500" },
  { label: "Favoris", value: p.favorites, icon: Star, color: "text-yellow-500" },
];

export default function DashboardStats(props: Props) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
      {stats(props).map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-wem-surface rounded-xl p-3 md:p-5 border border-wem-border">
          <div className={`${color} mb-2`}>
            <Icon size={16} />
          </div>
          <p className="text-xl md:text-2xl font-bold text-wem-text">{value}</p>
          <p className="text-wem-gray text-[10px] md:text-xs mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
