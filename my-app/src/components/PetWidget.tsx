import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';

// ─── Types ───────────────────────────────────────────────────────────────────

type AccessoryKey = 'none' | 'bow' | 'tophat' | 'crown' | 'headphones';
type ShirtKey = 'none' | 'stripes' | 'hearts' | 'stars' | 'plaid';
type ColorKey = 'classic' | 'pink' | 'blue' | 'lavender' | 'mint';

interface PetState {
  name: string;
  accessory: AccessoryKey;
  shirt: ShirtKey;
  color: ColorKey;
  health: number; // 0–100
  hunger: number; // 0–100
  happiness: number; // 0–100
}

// ─── Pixel Art Panda SVG ─────────────────────────────────────────────────────

const PANDA_COLORS: Record<ColorKey, { body: string; accent: string }> = {
  classic:  { body: '#f0f0f0', accent: '#222222' },
  pink:     { body: '#fde8f0', accent: '#c2185b' },
  blue:     { body: '#e3f0fd', accent: '#1565c0' },
  lavender: { body: '#f0e6ff', accent: '#6a1b9a' },
  mint:     { body: '#e2f7f0', accent: '#1b6a4a' },
};

const SHIRT_COLORS: Record<ShirtKey, string[]> = {
  none:    [],
  stripes: ['#e53935', '#ffffff'],
  hearts:  ['#e91e63', '#fce4ec'],
  stars:   ['#1565c0', '#ffd600'],
  plaid:   ['#2e7d32', '#c8e6c9'],
};

// Pixel grid: each entry is [col, row] in a 16x16 grid
// scale = size/16 per pixel
function PixelPanda({ size = 64, color, accessory, shirt }: {
  size?: number;
  color: ColorKey;
  accessory: AccessoryKey;
  shirt: ShirtKey;
}) {
  const s = size / 16; // pixel size
  const { body, accent } = PANDA_COLORS[color];

  // Helper to draw a rect at grid position
  const P = (col: number, row: number, fill: string, key: string) => (
    <Rect key={key} x={col * s} y={row * s} width={s} height={s} fill={fill} />
  );

  // Body pixels (16x16 grid)
  const bodyPixels = [
    // Ears
    [2,1],[3,1],[3,2],[2,2],   // left ear (accent)
    [12,1],[13,1],[12,2],[13,2], // right ear (accent)
    // Head
    ...[...Array(8)].map((_,i) => [4+i, 2]), // row 2 cols 4-11 (body)
    ...[...Array(10)].map((_,i) => [3+i, 3]), // row 3
    ...[...Array(10)].map((_,i) => [3+i, 4]),
    ...[...Array(10)].map((_,i) => [3+i, 5]),
    ...[...Array(10)].map((_,i) => [3+i, 6]),
    ...[...Array(8)].map((_,i) => [4+i, 7]),
    // Neck/body
    ...[...Array(6)].map((_,i) => [5+i, 8]),
    ...[...Array(8)].map((_,i) => [4+i, 9]),
    ...[...Array(8)].map((_,i) => [4+i,10]),
    ...[...Array(8)].map((_,i) => [4+i,11]),
    ...[...Array(8)].map((_,i) => [4+i,12]),
    // Legs
    [4,13],[5,13],[4,14],[5,14],[4,15],[5,15],
    [10,13],[11,13],[10,14],[11,14],[10,15],[11,15],
    // Arms
    [2,9],[3,9],[2,10],[3,10],[2,11],[3,11],
    [12,9],[13,9],[12,10],[13,10],[12,11],[13,11],
  ];

  const accentPixels = [
    // Ear fill
    [2,1],[3,1],[3,2],[2,2],
    [12,1],[13,1],[12,2],[13,2],
    // Eye patches
    [4,4],[5,4],[4,5],[5,5],
    [10,4],[11,4],[10,5],[11,5],
    // Nose
    [7,6],[8,6],
    // Mouth
    [6,7],[9,7],
  ];

  const eyePixels = [[4,4],[5,4],[4,5],[5,5],[10,4],[11,4],[10,5],[11,5]]; // white eye shine
  const nosePixel = [[7,6],[8,6]];

  // Shirt overlay (rows 9-12 on body)
  const shirtRows = [9,10,11,12];
  const shirtCols = [4,5,6,7,8,9,10,11];
  const shirtColors = SHIRT_COLORS[shirt];

  // Accessory pixels
  const renderAccessory = () => {
    if (accessory === 'none') return null;
    if (accessory === 'bow') return (
      <>
        {P(6,1,'#e91e63','b1')}{P(7,1,'#e91e63','b2')}{P(8,1,'#e91e63','b3')}{P(9,1,'#e91e63','b4')}
        {P(6,0,'#ff80ab','b5')}{P(9,0,'#ff80ab','b6')}{P(7,0,'#e91e63','b7')}{P(8,0,'#e91e63','b8')}
      </>
    );
    if (accessory === 'tophat') return (
      <>
        {[4,5,6,7,8,9,10,11].map(c => P(c,0,'#212121',`th0${c}`))}
        {[5,6,7,8,9,10].map(c => P(c,-1,'#212121',`th1${c}`))}
        {[5,6,7,8,9,10].map(c => P(c,-2,'#212121',`th2${c}`))}
        {P(6,0,'#c62828','hb1')}{P(7,0,'#c62828','hb2')}{P(8,0,'#c62828','hb3')}
      </>
    );
    if (accessory === 'crown') return (
      <>
        {P(5,0,'#ffd600','cr1')}{P(7,0,'#ffd600','cr2')}{P(9,0,'#ffd600','cr3')}{P(11,0,'#ffd600','cr4')}
        {[5,6,7,8,9,10,11].map(c => P(c,1,'#ffd600',`crb${c}`))}
        {P(7,0,'#e53935','crg1')}{P(9,0,'#e53935','crg2')}
      </>
    );
    if (accessory === 'headphones') return (
      <>
        {P(2,3,'#1565c0','hp1')}{P(2,4,'#1565c0','hp2')}{P(2,5,'#1565c0','hp3')}
        {P(13,3,'#1565c0','hp4')}{P(13,4,'#1565c0','hp5')}{P(13,5,'#1565c0','hp6')}
        {[3,4,5,6,7,8,9,10,11,12].map(c => P(c,2,'#1565c0',`hpb${c}`))}
        {P(1,3,'#42a5f5','hpl1')}{P(1,4,'#42a5f5','hpl2')}{P(1,5,'#42a5f5','hpl3')}
        {P(14,3,'#42a5f5','hpr1')}{P(14,4,'#42a5f5','hpr2')}{P(14,5,'#42a5f5','hpr3')}
      </>
    );
    return null;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Body base */}
      {bodyPixels.map(([c,r], i) => (
        <Rect key={`body${i}`} x={c*s} y={r*s} width={s} height={s} fill={body} />
      ))}
      {/* Accent patches */}
      {accentPixels.map(([c,r], i) => (
        <Rect key={`acc${i}`} x={c*s} y={r*s} width={s} height={s} fill={accent} />
      ))}
      {/* Eyes (white dots inside patches) */}
      <Rect x={4.5*s} y={4.5*s} width={0.6*s} height={0.6*s} fill="white" />
      <Rect x={10.5*s} y={4.5*s} width={0.6*s} height={0.6*s} fill="white" />
      {/* Nose */}
      <Rect x={7.2*s} y={6*s} width={1.6*s} height={0.8*s} fill={accent} rx={1} />
      {/* Mouth */}
      <Rect x={6.5*s} y={6.9*s} width={0.6*s} height={0.5*s} fill={accent} />
      <Rect x={8.9*s} y={6.9*s} width={0.6*s} height={0.5*s} fill={accent} />

      {/* Shirt */}
      {shirt !== 'none' && shirtRows.map(r =>
        shirtCols.map((c, ci) => (
          <Rect
            key={`shirt${r}${c}`}
            x={c*s} y={r*s} width={s} height={s}
            fill={shirtColors[ci % shirtColors.length]}
            opacity={0.75}
          />
        ))
      )}

      {/* Accessory */}
      {renderAccessory()}
    </Svg>
  );
}

// ─── Stat Bar ────────────────────────────────────────────────────────────────

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.track}>
        <View style={[statStyles.fill, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={statStyles.value}>{value}%</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { width: 80, fontSize: 13, color: '#0F2B3A', fontWeight: '600' },
  track: { flex: 1, height: 12, backgroundColor: '#C9ECF6', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  value: { width: 36, fontSize: 12, color: '#0F2B3A', textAlign: 'right' },
});

// ─── Option Pill ─────────────────────────────────────────────────────────────

function OptionPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[pillStyles.pill, selected && pillStyles.selected]}>
      <Text style={[pillStyles.text, selected && pillStyles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#9bd0ec',
    backgroundColor: '#fff',
    margin: 3,
  },
  selected: { backgroundColor: '#0F2B3A', borderColor: '#0F2B3A' },
  text: { fontSize: 13, color: '#0F2B3A' },
  selectedText: { color: '#fff' },
});

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={secStyles.row}>
      <Text style={secStyles.icon}>{icon}</Text>
      <Text style={secStyles.title}>{title}</Text>
    </View>
  );
}

const secStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 18 },
  icon: { fontSize: 16 },
  title: { fontSize: 14, fontWeight: '700', color: '#0F2B3A', letterSpacing: 0.5, textTransform: 'uppercase' },
});

// ─── Main PetWidget ──────────────────────────────────────────────────────────

const ACCESSORIES: { key: AccessoryKey; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'bow', label: 'Bow' },
  { key: 'tophat', label: 'Top Hat' },
  { key: 'crown', label: 'Crown' },
  { key: 'headphones', label: 'Headphones' },
];

const SHIRTS: { key: ShirtKey; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'stripes', label: 'Stripes' },
  { key: 'hearts', label: 'Hearts' },
  { key: 'stars', label: 'Stars' },
  { key: 'plaid', label: 'Plaid' },
];

const COLORS: { key: ColorKey; label: string; swatch: string }[] = [
  { key: 'classic', label: 'Classic', swatch: '#f0f0f0' },
  { key: 'pink', label: 'Sakura', swatch: '#fde8f0' },
  { key: 'blue', label: 'Ice', swatch: '#e3f0fd' },
  { key: 'lavender', label: 'Lavender', swatch: '#f0e6ff' },
  { key: 'mint', label: 'Mint', swatch: '#e2f7f0' },
];

export default function PetWidget() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'customize' | 'health'>('customize');
  const [pet, setPet] = useState<PetState>({
    name: 'Pandy',
    accessory: 'none',
    shirt: 'none',
    color: 'classic',
    health: 85,
    hunger: 60,
    happiness: 72,
  });

  const update = (patch: Partial<PetState>) => setPet(prev => ({ ...prev, ...patch }));

  return (
    <>
      {/* ── Floating Bubble ── */}
      <Pressable style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <PixelPanda size={56} color={pet.color} accessory={pet.accessory} shirt={pet.shirt} />
      </Pressable>

      {/* ── Popup Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>

        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />

        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Pet preview header */}
          <View style={styles.previewRow}>
            <PixelPanda size={72} color={pet.color} accessory={pet.accessory} shirt={pet.shirt} />
            <View style={styles.nameBlock}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petSpecies}>Pixel Panda</Text>
              <View style={styles.healthBadge}>
                <Text style={styles.healthBadgeText}>{pet.health}% health</Text>
              </View>
            </View>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, activeTab === 'customize' && styles.tabActive]}
              onPress={() => setActiveTab('customize')}>
              <Text style={[styles.tabText, activeTab === 'customize' && styles.tabTextActive]}>Customize</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'health' && styles.tabActive]}
              onPress={() => setActiveTab('health')}>
              <Text style={[styles.tabText, activeTab === 'health' && styles.tabTextActive]}> Health</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>

            {activeTab === 'customize' ? (
              <>
                {/* Color */}
                <SectionHeader title="Fur Color" icon="" />
                <View style={styles.pillRow}>
                  {COLORS.map(c => (
                    <Pressable
                      key={c.key}
                      onPress={() => update({ color: c.key })}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c.swatch },
                        pet.color === c.key && styles.colorSwatchSelected,
                      ]}>
                      <Text style={styles.colorLabel}>{c.label}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Accessories */}
                <SectionHeader title="Accessories" icon="" />
                <View style={styles.pillRow}>
                  {ACCESSORIES.map(a => (
                    <OptionPill
                      key={a.key}
                      label={a.label}
                      selected={pet.accessory === a.key}
                      onPress={() => update({ accessory: a.key })}
                    />
                  ))}
                </View>

                {/* Shirts */}
                <SectionHeader title="Outfit" icon="" />
                <View style={styles.pillRow}>
                  {SHIRTS.map(s => (
                    <OptionPill
                      key={s.key}
                      label={s.label}
                      selected={pet.shirt === s.key}
                      onPress={() => update({ shirt: s.key })}
                    />
                  ))}
                </View>
              </>
            ) : (
              <>
                <SectionHeader title="Vital Stats" icon="" />
                <StatBar label="Health" value={pet.health} color="#ecc8ec" />
                <StatBar label="Hunger" value={pet.hunger} color="#c2d0ef" />
                <StatBar label="Happiness" value={pet.happiness} color="#ceb0f2" />

                <SectionHeader title="Status" icon="" />
                <View style={styles.statusCard}>
                  <Text style={styles.statusText}>
                    {pet.health > 70
                      ? `${pet.name} is feeling great! Keep up the good work`
                      : pet.health > 40
                      ? `${pet.name} could use some attention. Complete tasks to boost health!`
                      : `${pet.name} needs help! Finish your assignments to restore health.`}
                  </Text>
                </View>

                <SectionHeader title="Tips" icon="" />
                <View style={styles.tipsList}>
                  <Text style={styles.tip}>Complete tasks to gain health points</Text>
                  <Text style={styles.tip}>Submit assignments on time for happiness</Text>
                  <Text style={styles.tip}>Finish exams to reduce hunger</Text>
                </View>
              </>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C9ECF6',
    borderWidth: 2,
    borderColor: '#0F2B3A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#C9ECF6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  nameBlock: { flex: 1, gap: 4 },
  petName: { fontSize: 22, fontWeight: '800', color: '#0F2B3A' },
  petSpecies: { fontSize: 13, color: '#2a7fa5' },
  healthBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  healthBadgeText: { fontSize: 12, color: '#0F2B3A', fontWeight: '600' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#0F2B3A' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  scrollArea: { flex: 1 },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  colorSwatch: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    margin: 3,
    alignItems: 'center',
  },
  colorSwatchSelected: { borderColor: '#0F2B3A', borderWidth: 2.5 },
  colorLabel: { fontSize: 12, color: '#0F2B3A', fontWeight: '600' },
  statusCard: {
    backgroundColor: '#C9ECF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  statusText: { fontSize: 14, color: '#0F2B3A', lineHeight: 20 },
  tipsList: { gap: 8 },
  tip: { fontSize: 13, color: '#0F2B3A', lineHeight: 19 },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#0F2B3A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
