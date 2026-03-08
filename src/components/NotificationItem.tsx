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
                relative overflow-hidden transition-transform duration-150 active:scale-[0.97] cursor-pointer select-none
                ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5'}
                rounded-2xl shadow-2xl backdrop-blur-3xl
            `}
            style={{
                background: 'rgba(20, 20, 22, 0.94)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.08) inset'
            }}
        >
            {/* Colored left accent bar */}
            <div className={`absolute top-0 left-0 bottom-0 w-[3px] rounded-l-2xl ${styles.indicator}`} />

            <div className="flex justify-between items-center mb-1 pl-2">
                <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md ${styles.iconBg} flex items-center justify-center`}>
                        {styles.icon}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {styles.label}
                    </span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{timestamp}</span>
            </div>

            <div className="pl-2">
                <div className="font-semibold text-sm" style={{ color: '#ffffff' }}>{title}</div>
                <p className={`text-xs mt-0.5 leading-snug ${compact ? 'line-clamp-1' : 'line-clamp-2'}`} style={{ color: 'rgba(255,255,255,0.72)' }}>
                    {message}
                </p>
            </div>
        </div>
    );
};
