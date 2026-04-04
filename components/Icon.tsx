import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export default function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  console.log('[Icon] render', { name, size, color });
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
