import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  LogOut, 
  ChevronRight,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  if (!authLoading && !user) {
    navigate('/');
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast.error('Erro ao salvar alterações');
    } else {
      toast.success('Perfil atualizado!');
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast.success('Até logo!');
  };

  const menuItems = [
    { icon: CreditCard, label: 'Formas de pagamento', path: '/payment-methods' },
    { icon: Bell, label: 'Notificações', path: '/notifications' },
    { icon: HelpCircle, label: 'Ajuda', path: '/help' },
    { icon: FileText, label: 'Termos de uso', path: '/terms' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-primary pt-safe-top pb-16">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold text-primary-foreground">Meu Perfil</h1>
        </div>
      </header>

      {/* Profile Card */}
      <div className="px-4 -mt-12">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {profile?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground truncate">
                        {profile?.name || 'Usuário'}
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFormData({
                          name: profile?.name || '',
                          phone: profile?.phone || '',
                        });
                        setEditing(true);
                      }}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {profile?.phone && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <section className="px-4 py-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => toast.info('Em breve!')}
              className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">
                {item.label}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* Logout Button */}
      <section className="px-4 pb-6">
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>
      </section>
    </AppLayout>
  );
}
