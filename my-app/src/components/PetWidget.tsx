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
import { usePet } from '@/context/pet-context';

//Types

type AccessoryKey = 'none' | 'bow' | 'tophat' | 'crown' | 'headphones';
type ShirtKey     = 'none' | 'stripes' | 'hearts' | 'stars' | 'plaid';
type ColorKey     = 'classic' | 'pink' | 'blue' | 'lavender' | 'mint';

//Pixel Art Panda

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

function PixelPanda({ size = 64, color, accessory, shirt }: {
  size?: number;
  color: ColorKey;
  accessory: AccessoryKey;
  shirt: ShirtKey;
}) {
  const s = size / 16;
  const { body, accent } = PANDA_COLORS[color];

  const bodyPixels: [number, number][] = [
    [2,1],[3,1],[3,2],[2,2],[12,1],[13,1],[12,2],[13,2],
    ...[...Array(8)].map((_,i):  [number,number] => [4+i, 2]),
    ...[...Array(10)].map((_,i): [number,number] => [3+i, 3]),
    ...[...Array(10)].map((_,i): [number,number] => [3+i, 4]),
    ...[...Array(10)].map((_,i): [number,number] => [3+i, 5]),
    ...[...Array(10)].map((_,i): [number,number] => [3+i, 6]),
    ...[...Array(8)].map((_,i):  [number,number] => [4+i, 7]),
    ...[...Array(6)].map((_,i):  [number,number] => [5+i, 8]),
    ...[...Array(8)].map((_,i):  [number,number] => [4+i, 9]),
    ...[...Array(8)].map((_,i):  [number,number] => [4+i,10]),
    ...[...Array(8)].map((_,i):  [number,number] => [4+i,11]),
    ...[...Array(8)].map((_,i):  [number,number] => [4+i,12]),
    [4,13],[5,13],[4,14],[5,14],[4,15],[5,15],
    [10,13],[11,13],[10,14],[11,14],[10,15],[11,15],
    [2,9],[3,9],[2,10],[3,10],[2,11],[3,11],
    [12,9],[13,9],[12,10],[13,10],[12,11],[13,11],
  ];

  const accentPixels: [number, number][] = [
    [2,1],[3,1],[3,2],[2,2],[12,1],[13,1],[12,2],[13,2],
    [4,4],[5,4],[4,5],[5,5],[10,4],[11,4],[10,5],[11,5],
  ];

  const shirtRows = [9,10,11,12];
  const shirtCols = [4,5,6,7,8,9,10,11];
  const shirtColors = SHIRT_COLORS[shirt];

  const renderAccessory = () => {
    if (accessory === 'none') return null;
    if (accessory === 'bow') return (
      <>
        {[6,7,8,9].map(c => <Rect key={`b${c}`}  x={c*s} y={1*s} width={s} height={s} fill="#e91e63" />)}
        {[6,9].map(c =>     <Rect key={`bt${c}`} x={c*s} y={0*s} width={s} height={s} fill="#ff80ab" />)}
        {[7,8].map(c =>     <Rect key={`bm${c}`} x={c*s} y={0*s} width={s} height={s} fill="#e91e63" />)}
      </>
    );
    if (accessory === 'tophat') return (
      <>
        {[4,5,6,7,8,9,10,11].map(c => <Rect key={`th0${c}`} x={c*s} y={0*s}  width={s} height={s} fill="#212121" />)}
        {[5,6,7,8,9,10].map(c =>      <Rect key={`th1${c}`} x={c*s} y={-1*s} width={s} height={s} fill="#212121" />)}
        {[5,6,7,8,9,10].map(c =>      <Rect key={`th2${c}`} x={c*s} y={-2*s} width={s} height={s} fill="#212121" />)}
        {[6,7,8].map(c =>             <Rect key={`hb${c}`}  x={c*s} y={0*s}  width={s} height={s} fill="#c62828" />)}
      </>
    );
    if (accessory === 'crown') return (
      <>
        {[5,7,9,11].map(c =>        <Rect key={`cr${c}`}  x={c*s} y={0*s} width={s} height={s} fill="#ffd600" />)}
        {[5,6,7,8,9,10,11].map(c => <Rect key={`crb${c}`} x={c*s} y={1*s} width={s} height={s} fill="#ffd600" />)}
        {[7,9].map(c =>             <Rect key={`crg${c}`} x={c*s} y={0*s} width={s} height={s} fill="#e53935" />)}
      </>
    );
    if (accessory === 'headphones') return (
      <>
        {[3,4,5,6,7,8,9,10,11,12].map(c => <Rect key={`hpb${c}`}  x={c*s}  y={2*s} width={s} height={s} fill="#1565c0" />)}
        {[3,4,5].map(r =>                   <Rect key={`hpl${r}`}  x={2*s}  y={r*s} width={s} height={s} fill="#1565c0" />)}
        {[3,4,5].map(r =>                   <Rect key={`hpr${r}`}  x={13*s} y={r*s} width={s} height={s} fill="#1565c0" />)}
        {[3,4,5].map(r =>                   <Rect key={`hpll${r}`} x={1*s}  y={r*s} width={s} height={s} fill="#42a5f5" />)}
        {[3,4,5].map(r =>                   <Rect key={`hprr${r}`} x={14*s} y={r*s} width={s} height={s} fill="#42a5f5" />)}
      </>
    );
    return null;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {bodyPixels.map(([c,r], i) =>   <Rect key={`body${i}`} x={c*s} y={r*s} width={s} height={s} fill={body} />)}
      {accentPixels.map(([c,r], i) => <Rect key={`acc${i}`}  x={c*s} y={r*s} width={s} height={s} fill={accent} />)}
      <Rect x={4.5*s} y={4.5*s} width={0.6*s} height={0.6*s} fill="white" />
      <Rect x={10.5*s} y={4.5*s} width={0.6*s} height={0.6*s} fill="white" />
      <Rect x={7.2*s} y={6*s} width={1.6*s} height={0.8*s} fill={accent} rx={1} />
      <Rect x={6.5*s} y={6.9*s} width={0.6*s} height={0.5*s} fill={accent} />
      <Rect x={8.9*s} y={6.9*s} width={0.6*s} height={0.5*s} fill={accent} />
      {shirt !== 'none' && shirtRows.map(r =>
        shirtCols.map((c, ci) => (
          <Rect key={`shirt${r}${c}`} x={c*s} y={r*s} width={s} height={s}
            fill={shirtColors[ci % shirtColors.length]} opacity={0.75} />
        ))
      )}
      {renderAccessory()}
    </Svg>
  );
}

//Stat Bar

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
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { width: 90, fontSize: 13, color: '#0F2B3A', fontWeight: '600' },
  track: { flex: 1, height: 12, backgroundColor: '#C9ECF6', borderRadius: 6, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 6 },
  value: { width: 36, fontSize: 12, color: '#0F2B3A', textAlign: 'right' },
});

//Option Pill

function OptionPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[pillStyles.pill, selected && pillStyles.selected]}>
      <Text style={[pillStyles.text, selected && pillStyles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const pillStyles = StyleSheet.create({
  pill:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#9bd0ec', backgroundColor: '#fff', margin: 3 },
  selected:     { backgroundColor: '#0F2B3A', borderColor: '#0F2B3A' },
  text:         { fontSize: 13, color: '#0F2B3A' },
  selectedText: { color: '#fff' },
});

//Section Header

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={secStyles.row}>
      <Text style={secStyles.title}>{title}</Text>
    </View>
  );
}

const secStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 18 },
  title: { fontSize: 14, fontWeight: '700', color: '#0F2B3A', letterSpacing: 0.5, textTransform: 'uppercase' },
});

//Options Config

const ACCESSORIES: { key: AccessoryKey; label: string }[] = [
  { key: 'none',       label: 'None' },
  { key: 'bow',        label: 'Bow' },
  { key: 'tophat',     label: 'Top Hat' },
  { key: 'crown',      label: 'Crown' },
  { key: 'headphones', label: 'Headphones' },
];

const SHIRTS: { key: ShirtKey; label: string }[] = [
  { key: 'none',    label: 'None' },
  { key: 'stripes', label: 'Stripes' },
  { key: 'hearts',  label: 'Hearts' },
  { key: 'stars',   label: 'Stars' },
  { key: 'plaid',   label: 'Plaid' },
];

const COLORS: { key: ColorKey; label: string; swatch: string }[] = [
  { key: 'classic',  label: 'Classic',  swatch: '#f0f0f0' },
  { key: 'pink',     label: 'Sakura',   swatch: '#fde8f0' },
  { key: 'blue',     label: 'Ice',      swatch: '#e3f0fd' },
  { key: 'lavender', label: 'Lavender', swatch: '#f0e6ff' },
  { key: 'mint',     label: 'Mint',     swatch: '#e2f7f0' },
];

//Helpers

function getStatusMessage(name: string, health: number): string {
  if (health >= 80) return `${name} is thriving! You're crushing it.`;
  if (health >= 60) return `${name} is doing well. Keep completing tasks!`;
  if (health >= 40) return `${name} is feeling a bit tired. Don't miss deadlines!`;
  if (health >= 20) return `${name} needs attention! Finish some tasks soon.`;
  return `${name} is struggling. Complete tasks to help recover!`;
}

function getOverallColor(health: number): string {
  if (health >= 70) return '#43a047';
  if (health >= 40) return '#fb8c00';
  return '#e53935';
}

//Main PetWidget

export default function PetWidget() {
  const { stats, appearance, setAppearance } = usePet();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab]       = useState<'customize' | 'health'>('customize');

  const update = (patch: Partial<typeof appearance>) => setAppearance(patch);

  return (
    <>
      {/* Floating Bubble */}
      <Pressable style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <PixelPanda size={56} color={appearance.color} accessory={appearance.accessory} shirt={appearance.shirt} />
        <View style={[styles.healthDot, { backgroundColor: getOverallColor(stats.health) }]} />
      </Pressable>

      {/* Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>

        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Pet preview */}
          <View style={styles.previewRow}>
            <PixelPanda size={72} color={appearance.color} accessory={appearance.accessory} shirt={appearance.shirt} />
            <View style={styles.nameBlock}>
              <Text style={styles.petName}>{appearance.name}</Text>
              <View style={[styles.healthBadge, { backgroundColor: getOverallColor(stats.health) }]}>
                <Text style={styles.healthBadgeText}>{stats.health}% health</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, activeTab === 'customize' && styles.tabActive]}
              onPress={() => setActiveTab('customize')}>
              <Text style={[styles.tabText, activeTab === 'customize' && styles.tabTextActive]}>Customize</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'health' && styles.tabActive]}
              onPress={() => setActiveTab('health')}>
              <Text style={[styles.tabText, activeTab === 'health' && styles.tabTextActive]}>Health</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {activeTab === 'customize' ? (
              <>
                <SectionHeader title="Fur Color" />
                <View style={styles.pillRow}>
                  {COLORS.map(c => (
                    <Pressable key={c.key} onPress={() => update({ color: c.key })}
                      style={[styles.colorSwatch, { backgroundColor: c.swatch },
                        appearance.color === c.key && styles.colorSwatchSelected]}>
                      <Text style={styles.colorLabel}>{c.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <SectionHeader title="Accessories" />
                <View style={styles.pillRow}>
                  {ACCESSORIES.map(a => (
                    <OptionPill key={a.key} label={a.label}
                      selected={appearance.accessory === a.key}
                      onPress={() => update({ accessory: a.key })} />
                  ))}
                </View>

                <SectionHeader title="Outfit" />
                <View style={styles.pillRow}>
                  {SHIRTS.map(s => (
                    <OptionPill key={s.key} label={s.label}
                      selected={appearance.shirt === s.key}
                      onPress={() => update({ shirt: s.key })} />
                  ))}
                </View>
              </>
            ) : (
              <>
                <SectionHeader title="Vital Stats" />
                <StatBar label="Health"    value={stats.health}    color="#fde8f0" />
                <StatBar label="Hunger"    value={stats.hunger}    color="#e3f0fd" />
                <StatBar label="Happiness" value={stats.happiness} color="#f0e6ff" />

                <SectionHeader title="Status" />
                <View style={styles.statusCard}>
                  <Text style={styles.statusText}>
                    {getStatusMessage(appearance.name, stats.health)}
                  </Text>
                </View>

                <SectionHeader title="How it works" />
                <View style={styles.tipsList}>
                  <Text style={styles.tip}>Complete a task: small boost (+8 health, +5 hunger, +10 happiness)</Text>
                  <Text style={styles.tip}>Complete an assignment: medium boost (+13 health, +8 hunger, +15 happiness)</Text>
                  <Text style={styles.tip}>Complete an exam: big boost (+18 health, +12 hunger, +20 happiness)</Text>
                  <Text style={styles.tip}>Missing a task: -12 health, -8 hunger, -15 happiness</Text>
                  <Text style={styles.tip}>Missing an assignment: -18 health, -12 hunger, -20 happiness</Text>
                  <Text style={styles.tip}>Missing an exam: -25 health, -18 hunger, -28 happiness</Text>
                </View>
              </>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

//Styles

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute', bottom: 100, right: 20,
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#C9ECF6', borderWidth: 2, borderColor: '#0F2B3A',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 8, zIndex: 9999,
  },
  healthDot: {
    position: 'absolute', top: 4, right: 4,
    width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff',
  },
  backdrop:            { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet:               { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 20, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 12 },
  handle:              { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  previewRow:          { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#C9ECF6', borderRadius: 16, padding: 16, marginBottom: 16 },
  nameBlock:           { flex: 1, gap: 4 },
  petName:             { fontSize: 22, fontWeight: '800', color: '#0F2B3A' },
  healthBadge:         { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 4 },
  healthBadgeText:     { fontSize: 12, color: '#fff', fontWeight: '600' },
  tabRow:              { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 3, marginBottom: 4 },
  tab:                 { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive:           { backgroundColor: '#0F2B3A' },
  tabText:             { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive:       { color: '#fff' },
  scrollArea:          { flex: 1 },
  pillRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  colorSwatch:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', margin: 3, alignItems: 'center' },
  colorSwatchSelected: { borderColor: '#0F2B3A', borderWidth: 2.5 },
  colorLabel:          { fontSize: 12, color: '#0F2B3A', fontWeight: '600' },
  statusCard:          { backgroundColor: '#C9ECF6', borderRadius: 12, padding: 14, marginBottom: 4 },
  statusText:          { fontSize: 14, color: '#0F2B3A', lineHeight: 20 },
  tipsList:            { gap: 8 },
  tip:                 { fontSize: 13, color: '#0F2B3A', lineHeight: 19 },
  closeButton:         { marginTop: 12, backgroundColor: '#0F2B3A', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  closeText:           { color: '#fff', fontSize: 16, fontWeight: '700' },
});
