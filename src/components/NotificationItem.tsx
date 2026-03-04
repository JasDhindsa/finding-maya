import React from 'react';
import { MessageSquare, Shield, Hash, CreditCard, Bell, Globe, Linkedin } from 'lucide-react';

interface NotificationItemProps {
    app: string;
    title: string;
    message: string;
    timestamp: string;
    onClick?: () => void;
    compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ app, title, message, timestamp, onClick, compact }) => {
    const getAppStyles = () => {
        switch (app.toLowerCase()) {
            case 'messages':
                return {
                    icon: <MessageSquare size={14} className="text-white" />,
                    iconBg: 'bg-green-500',
                    border: 'border-green-500/20',
                    indicator: 'bg-green-500',
                    label: 'Messages'
                };
            case 'signal':
                return {
                    icon: <Shield size={14} className="text-white" />,
                    iconBg: 'bg-blue-500',
                    border: 'border-blue-500/20',
                    indicator: 'bg-blue-500',
                    label: 'Signal'
                };
            case 'slack':
                return {
                    icon: <Hash size={14} className="text-white" />,
                    iconBg: 'bg-[#4A154B]',
                    border: 'border-[#4A154B]/20',
                    indicator: 'bg-[#E01E5A]',
                    label: 'Slack'
                };
            case 'venmo':
                return {
                    icon: <CreditCard size={14} className="text-white" />,
                    iconBg: 'bg-[#008CFF]',
                    border: 'border-[#008CFF]/20',
                    indicator: 'bg-[#008CFF]',
                    label: 'Venmo'
                };
            case 'linkedin':
                return {
                    icon: <Linkedin size={14} className="text-white" />,
                    iconBg: 'bg-[#0077B5]',
                    border: 'border-[#0077B5]/20',
                    indicator: 'bg-[#0077B5]',
                    label: 'LinkedIn'
                };
            case 'browser':
            case 'chase':
                return {
                    icon: <Globe size={14} className="text-white" />,
                    iconBg: 'bg-blue-600',
                    border: 'border-blue-600/20',
                    indicator: 'bg-blue-600',
                    label: app
                };
            default:
                return {
                    icon: <Bell size={14} className="text-white" />,
                    iconBg: 'bg-gray-500',
                    border: 'border-gray-500/20',
                    indicator: 'bg-gray-500',
                    label: app
                };
        }
    };

    const styles = getAppStyles();

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer
                ${compact ? 'p-3' : 'p-4'}
                bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg
                ${styles.border}
            `}
        >
            {/* App Indicator Line */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.indicator}`} />

            <div className="flex justify-between items-start mb-1 ml-1">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${styles.iconBg} flex items-center justify-center shadow-lg shadow-black/20`}>
                        {styles.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {styles.label}
                    </span>
                </div>
                <span className="text-[10px] text-white/40 font-medium">{timestamp}</span>
            </div>

            <div className="ml-1">
                <div className="font-bold text-sm text-white">{title}</div>
                <p className={`text-xs text-white/70 mt-0.5 leading-snug ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
                    {message}
                </p>
            </div>

            {/* Subtle Reflection */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        </div>
    );
};
