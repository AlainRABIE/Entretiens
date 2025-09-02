"use client";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

// Palettes de couleurs
export const palettes = {
	light: {
		primary: "#7367f0",
		secondary: "#f5f6fa",
		accent: "#e3e6fc",
		success: "#28c76f",
		info: "#00cfe8",
		warning: "#ff9f43",
		danger: "#ea5455",
		light: "#f8f8f8",
		dark: "#4b4b5a",
		gray100: "#f4f6fb",
		gray200: "#e9ebf0",
		gray300: "#eaeaea",
		gray400: "#b9b9c3",
		gray500: "#7367f0",
		gray600: "#82868b",
		gray700: "#6e6b7b",
		gray800: "#4b4b5a",
		gray900: "#222f3e",
		white: "#fff",
		background: "#f4f6fb"
	},
	dark: {
		primary: "#181c23",
		secondary: "#22242a",
		background: "#181c23",
		accent: "#3a4256",
		success: "#22d3ee",
		info: "#818cf8",
		warning: "#fbbf24",
		danger: "#f87171",
		light: "#374151",
		dark: "#f9fafb",
		gray100: "#1f2937",
		gray200: "#111827",
		gray300: "#374151",
		gray400: "#4b5563",
		gray500: "#6b7280",
		gray600: "#a1a1aa",
		gray700: "#bfc7d5",
		gray800: "#e0e6f0",
		gray900: "#f8fafc",
		white: "#fff"
	}
};

// Configuration des liens de la sidebar
export const sidebarLinks = [
	{ label: "Home", icon: "🏠", href: "/home" },
	{ label: "Utilisateurs", icon: "👤", href: "/Utilisateur" },
	{ label: "Mon Profil", icon: "👤", href: "/profil" },
	{ label: "Sous-domaines", icon: "🌐", href: "/sous-domaine" },
	{ label: "Journal", icon: "📝", href: "#" },
];

// Composant Sidebar
export const Sidebar = ({ onLogout, open, palette }: { onLogout: () => void; open: boolean; palette: any }) => (
	<aside
		style={{
			width: open ? 220 : 0,
			background: palette.secondary,
			color: palette.dark,
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
			boxShadow: open ? "2px 0 16px #0002" : undefined,
			transition: "width 0.3s cubic-bezier(.4,2,.6,1)",
			overflow: "hidden",
			position: "fixed",
			top: 64,
			left: 0,
			zIndex: 100,
			borderTopRightRadius: 18,
			borderBottomRightRadius: 18,
		}}
	>
		<div style={{ height: 32 }} />
		<nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 10px" }}>
			{sidebarLinks.map(link => (
				<a
					key={link.label}
					href={link.href}
					style={{
						color: palette.dark,
						fontWeight: 600,
						textDecoration: "none",
						borderRadius: 10,
						padding: "10px 16px",
						margin: "2px 0",
						display: "flex",
						alignItems: "center",
						gap: 10,
						fontSize: 15,
						transition: "background 0.18s",
					}}
					onMouseOver={e => (e.currentTarget.style.background = palette.accent)}
					onMouseOut={e => (e.currentTarget.style.background = "")}
				>
					<span style={{ fontSize: 18 }}>{link.icon}</span>
					{link.label}
				</a>
			))}
		</nav>
		<div style={{ padding: "0 10px", marginBottom: "20px" }}>
			<button
				onClick={onLogout}
				style={{
					width: "100%",
					color: palette.white,
					backgroundColor: palette.danger,
					fontWeight: 600,
					textDecoration: "none",
					borderRadius: 10,
					padding: "10px 16px",
					margin: "2px 0",
					display: "flex",
					alignItems: "center",
					gap: 10,
					fontSize: 15,
					border: "none",
					cursor: "pointer",
					transition: "background 0.18s",
				}}
				onMouseOver={e => (e.currentTarget.style.backgroundColor = palette.warning)}
				onMouseOut={e => (e.currentTarget.style.backgroundColor = palette.danger)}
			>
				<span style={{ fontSize: 18 }}>🚪</span>
				Déconnexion
			</button>
		</div>
		<div style={{ flex: 0, height: 24 }} />
	</aside>
);

// Composant Header
export const Header = ({ 
	title, 
	userEmail, 
	theme, 
	setTheme, 
	palette, 
	sidebarOpen, 
	setSidebarOpen, 
	onLogout 
}: { 
	title: string;
	userEmail: string;
	theme: 'light' | 'dark';
	setTheme: (theme: 'light' | 'dark') => void;
	palette: any;
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
	onLogout: () => void;
}) => (
	<header style={{
		height: 64,
		background: palette.secondary,
		color: theme === 'dark' ? palette.white : palette.dark,
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "0 32px 0 16px",
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 200,
		boxShadow: "0 2px 8px #0001"
	}}>
		<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
			<button
				onClick={() => setSidebarOpen(o => !o)}
				style={{
					background: 'transparent',
					border: `2px solid ${theme === 'dark' ? '#fff' : '#222'}`,
					color: theme === 'dark' ? '#fff' : '#222',
					fontSize: 28,
					cursor: 'pointer',
					marginRight: 8,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: '50%',
					width: 44,
					height: 44,
					transition: 'background 0.2s, border-color 0.2s, color 0.2s',
					outline: 'none',
				}}
				aria-label="Ouvrir/fermer le menu"
				onMouseOver={e => {
					e.currentTarget.style.background = theme === 'dark' ? '#fff2' : '#2221';
					e.currentTarget.style.borderColor = theme === 'dark' ? '#fff' : '#222';
				}}
				onMouseOut={e => {
					e.currentTarget.style.background = 'transparent';
					e.currentTarget.style.borderColor = theme === 'dark' ? '#fff' : '#222';
				}}
			>
				<span style={{ fontSize: 28, lineHeight: 1, color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>&#9776;</span>
			</button>
			<span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>{title}</span>
		</div>
		<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
			{/* Switch mode clair/sombre */}
			<button
				onClick={() => setTheme(theme === "light" ? "dark" : "light")}
				style={{
					background: palette.secondary,
					color: palette.primary,
					border: "none",
					borderRadius: 8,
					padding: "6px 16px",
					fontWeight: 700,
					fontSize: 15,
					cursor: "pointer",
					marginRight: 8
				}}
				aria-label="Changer le mode clair/sombre"
			>
				{theme === "light" ? "🌞" : "🌙"}
			</button>
			<span style={{ fontWeight: 700, fontSize: 16, background: palette.secondary, borderRadius: 8, padding: "6px 16px" }}>{userEmail}</span>
			<button
				onClick={onLogout}
				style={{ background: palette.danger, color: palette.white, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
			>Déconnexion</button>
		</div>
	</header>
);

// Hook pour gérer l'authentification et la déconnexion
export const useAuth = () => {
	const router = useRouter();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/login');
	};

	return { handleLogout };
};
