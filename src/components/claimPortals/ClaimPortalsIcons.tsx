import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme';

type IconProps = {
  color?: string;
  size?: number;
};

function Canvas({
  size = 18,
  children,
}: {
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.canvas, {width: size, height: size}]}>{children}</View>
  );
}

export function MenuIcon({color = colors.textPrimary, size = 18}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.menuLine, {backgroundColor: color, width: size}]} />
      <View
        style={[
          styles.menuLine,
          {backgroundColor: color, width: size * 0.72, marginTop: 4},
        ]}
      />
      <View
        style={[
          styles.menuLine,
          {backgroundColor: color, width: size * 0.88, marginTop: 4},
        ]}
      />
    </Canvas>
  );
}

export function MoonIcon({
  color = colors.textPrimary,
  size = 18,
  cutColor = colors.surface,
}: IconProps & {cutColor?: string}) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.moon,
          {
            width: size * 0.78,
            height: size * 0.78,
            borderColor: color,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.moonCut,
          {
            width: size * 0.58,
            height: size * 0.58,
            backgroundColor: cutColor,
            right: -2,
            top: 1,
          },
        ]}
      />
    </Canvas>
  );
}

export function SunIcon({color = '#F59E0B', size = 18}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.sun,
          {
            width: size * 0.46,
            height: size * 0.46,
            backgroundColor: color,
          },
        ]}
      />
    </Canvas>
  );
}

export function QuestionIcon({
  color = colors.textPrimary,
  size = 18,
}: IconProps) {
  return (
    <Canvas size={size}>
      <Text
        style={[
          styles.questionMark,
          {color, fontSize: size * 0.92, lineHeight: size},
        ]}>
        ?
      </Text>
    </Canvas>
  );
}

export function SearchIcon({color = colors.textMuted, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.searchRing,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.searchHandle,
          {
            backgroundColor: color,
            width: size * 0.32,
            right: 1,
            bottom: 1,
          },
        ]}
      />
    </Canvas>
  );
}

export function FilterIcon({color = colors.textPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.filterTop, {backgroundColor: color, width: size}]} />
      <View
        style={[
          styles.filterMid,
          {backgroundColor: color, width: size * 0.62, marginTop: 3},
        ]}
      />
      <View
        style={[
          styles.filterMid,
          {backgroundColor: color, width: size * 0.28, marginTop: 3},
        ]}
      />
    </Canvas>
  );
}

export function CloseIcon({color = colors.onPrimary, size = 14}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.closeBar,
          {backgroundColor: color, width: size, transform: [{rotate: '45deg'}]},
        ]}
      />
      <View
        style={[
          styles.closeBar,
          {
            backgroundColor: color,
            width: size,
            transform: [{rotate: '-45deg'}],
          },
        ]}
      />
    </Canvas>
  );
}

export function DotsIcon({color = colors.textMuted, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <View style={[styles.dot, {backgroundColor: color, marginTop: 3}]} />
      <View style={[styles.dot, {backgroundColor: color, marginTop: 3}]} />
    </Canvas>
  );
}

export function CrownIcon({color = '#C9A227', size = 12}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.crownBand, {backgroundColor: color, width: size * 0.78}]} />
      <View style={styles.crownPoints}>
        <View style={[styles.crownPoint, {borderBottomColor: color}]} />
        <View
          style={[
            styles.crownPoint,
            styles.crownPointTall,
            {borderBottomColor: color},
          ]}
        />
        <View style={[styles.crownPoint, {borderBottomColor: color}]} />
      </View>
    </Canvas>
  );
}

export function ChevronRightIcon({
  color = colors.textMuted,
  size = 8,
}: IconProps) {
  return (
    <View
      style={[
        styles.chevron,
        {width: size, height: size, borderColor: color},
      ]}
    />
  );
}

export function ChevronLeftIcon({
  color = colors.textMuted,
  size = 8,
}: IconProps) {
  return (
    <View
      style={[
        styles.chevron,
        {
          width: size,
          height: size,
          borderColor: color,
          transform: [{rotate: '225deg'}],
        },
      ]}
    />
  );
}

// export function ChevronDownIcon({
//   color = colors.textMuted,
//   size = 8,
// }: IconProps) {
//   return (
//     <View
//       style={[
//         styles.chevron,
//         {
//           width: size,
//           height: size,
//           borderColor: color,
//           transform: [{rotate: '135deg'}],
//         },
//       ]}
//     />
//   );
// }

export function BuildingIcon({color = colors.primary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.building,
          {borderColor: color, width: size * 0.72, height: size * 0.82},
        ]}>
        <View style={styles.windowRow}>
          <View style={[styles.window, {backgroundColor: color}]} />
          <View style={[styles.window, {backgroundColor: color}]} />
        </View>
        <View style={[styles.windowRow, {marginTop: 2}]}>
          <View style={[styles.window, {backgroundColor: color}]} />
          <View style={[styles.window, {backgroundColor: color}]} />
        </View>
      </View>
    </Canvas>
  );
}

export function LayersIcon({color = colors.success, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.layer,
          {borderColor: color, width: size * 0.78, height: size * 0.34},
        ]}
      />
      <View
        style={[
          styles.layer,
          {
            borderColor: color,
            width: size * 0.78,
            height: size * 0.34,
            marginTop: -4,
          },
        ]}
      />
    </Canvas>
  );
}

export function BoxIcon({color = '#EA580C', size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.box,
          {borderColor: color, width: size * 0.72, height: size * 0.72},
        ]}
      />
    </Canvas>
  );
}

export function CalendarIcon({color = '#7C3AED', size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.calendar,
          {borderColor: color, width: size * 0.78, height: size * 0.72},
        ]}>
        <View style={[styles.calendarBar, {backgroundColor: color}]} />
      </View>
    </Canvas>
  );
}

export function DocumentIcon({color = '#D97706', size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.document,
          {borderColor: color, width: size * 0.58, height: size * 0.76},
        ]}
      />
    </Canvas>
  );
}

export function BriefcaseMiniIcon({
  color = colors.textMuted,
  size = 14,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.caseHandle,
          {borderColor: color, width: size * 0.36, height: size * 0.22},
        ]}
      />
      <View
        style={[
          styles.caseBody,
          {backgroundColor: color, width: size * 0.78, height: size * 0.48},
        ]}
      />
    </Canvas>
  );
}

export function FolderMiniIcon({
  color = colors.textMuted,
  size = 14,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.folderTab,
          {backgroundColor: color, width: size * 0.38},
        ]}
      />
      <View
        style={[
          styles.folderBody,
          {backgroundColor: color, width: size * 0.8, height: size * 0.5},
        ]}
      />
    </Canvas>
  );
}

export function UsersMiniIcon({
  color = colors.primary,
  size = 14,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={styles.usersRow}>
        <View style={[styles.userHead, {backgroundColor: color}]} />
        <View
          style={[
            styles.userHead,
            {backgroundColor: color, marginLeft: -3, opacity: 0.7},
          ]}
        />
      </View>
      <View
        style={[
          styles.userBody,
          {backgroundColor: color, width: size * 0.78, height: size * 0.32},
        ]}
      />
    </Canvas>
  );
}

export function HomeTabIcon({color = colors.textMuted, size = 18}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.homeRoof,
          {borderBottomColor: color, borderLeftWidth: size * 0.34, borderRightWidth: size * 0.34},
        ]}
      />
      <View
        style={[
          styles.homeBody,
          {borderColor: color, width: size * 0.52, height: size * 0.38},
        ]}
      />
    </Canvas>
  );
}

export function GridTabIcon({color = colors.textMuted, size = 18}: IconProps) {
  const cell = size * 0.32;
  return (
    <Canvas size={size}>
      <View style={styles.gridWrap}>
        {[0, 1, 2, 3].map(index => (
          <View
            key={index}
            style={[
              styles.gridCell,
              {width: cell, height: cell, backgroundColor: color},
            ]}
          />
        ))}
      </View>
    </Canvas>
  );
}

export function RequestsTabIcon({
  color = colors.textMuted,
  size = 18,
}: IconProps) {
  return <DocumentIcon color={color} size={size} />;
}

export function ProfileTabIcon({
  color = colors.textMuted,
  size = 18,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.profileHead,
          {backgroundColor: color, width: size * 0.38, height: size * 0.38},
        ]}
      />
      <View
        style={[
          styles.userBody,
          {backgroundColor: color, width: size * 0.72, height: size * 0.32},
        ]}
      />
    </Canvas>
  );
}

export function DashboardTabIcon({
  color = colors.textMuted,
  size = 18,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.chartRow, {height: size * 0.72}]}>
        <View
          style={[
            styles.chartBar,
            {backgroundColor: color, width: size * 0.16, height: size * 0.36},
          ]}
        />
        <View
          style={[
            styles.chartBar,
            {backgroundColor: color, width: size * 0.16, height: size * 0.58},
          ]}
        />
        <View
          style={[
            styles.chartBar,
            {backgroundColor: color, width: size * 0.16, height: size * 0.28},
          ]}
        />
      </View>
    </Canvas>
  );
}

export function EyeMiniIcon({color = colors.textPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.eye,
          {borderColor: color, width: size * 0.86, height: size * 0.5},
        ]}>
        <View
          style={[
            styles.eyePupil,
            {backgroundColor: color, width: size * 0.2, height: size * 0.2},
          ]}
        />
      </View>
    </Canvas>
  );
}

export function PencilMiniIcon({
  color = colors.textPrimary,
  size = 16,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.pencil,
          {backgroundColor: color, width: size * 0.18, height: size * 0.72},
        ]}
      />
    </Canvas>
  );
}

export function CopyMiniIcon({
  color = colors.textPrimary,
  size = 16,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.copyBack,
          {borderColor: color, width: size * 0.58, height: size * 0.62},
        ]}
      />
      <View
        style={[
          styles.copyFront,
          {borderColor: color, width: size * 0.58, height: size * 0.62},
        ]}
      />
    </Canvas>
  );
}

export function TrashMiniIcon({color = colors.danger, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.trashLid, {backgroundColor: color, width: size * 0.7}]} />
      <View
        style={[
          styles.trashBody,
          {borderColor: color, width: size * 0.58, height: size * 0.52},
        ]}
      />
    </Canvas>
  );
}

export function ClockMiniIcon({color = '#F59E0B', size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.clock,
          {borderColor: color, width: size * 0.78, height: size * 0.78},
        ]}
      />
    </Canvas>
  );
}

export function CheckMiniIcon({color = colors.success, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.check,
          {borderColor: color, width: size * 0.42, height: size * 0.24},
        ]}
      />
    </Canvas>
  );
}

export function PlusMiniIcon({color = colors.onPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.plusH, {backgroundColor: color, width: size * 0.7}]} />
      <View
        style={[
          styles.plusV,
          {backgroundColor: color, height: size * 0.7},
        ]}
      />
    </Canvas>
  );
}

export function GlobeMiniIcon({
  color = colors.onPrimary,
  size = 16,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.globe,
          {borderColor: color, width: size * 0.78, height: size * 0.78},
        ]}
      />
    </Canvas>
  );
}

export function ShieldMiniIcon({
  color = colors.onPrimary,
  size = 16,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.shield,
          {backgroundColor: color, width: size * 0.58, height: size * 0.7},
        ]}
      />
    </Canvas>
  );
}

export function KeyMiniIcon({
  color = colors.primary,
  size = 16,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={styles.keyRow}>
        <View
          style={[
            styles.keyHead,
            {
              borderColor: color,
              width: size * 0.4,
              height: size * 0.4,
            },
          ]}
        />
        <View
          style={[
            styles.keyShaft,
            {backgroundColor: color, width: size * 0.42, height: size * 0.14},
          ]}
        />
      </View>
      <View
        style={[
          styles.keyBit,
          {backgroundColor: color, width: size * 0.16, height: size * 0.18},
        ]}
      />
    </Canvas>
  );
}

export function ListMiniIcon({color = colors.onPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View style={[styles.listLine, {backgroundColor: color, width: size * 0.8}]} />
      <View
        style={[
          styles.listLine,
          {backgroundColor: color, width: size * 0.8, marginTop: 3},
        ]}
      />
      <View
        style={[
          styles.listLine,
          {backgroundColor: color, width: size * 0.56, marginTop: 3},
        ]}
      />
    </Canvas>
  );
}

export function BellMiniIcon({color = colors.textPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.bellDome,
          {borderColor: color, width: size * 0.56, height: size * 0.48},
        ]}
      />
      <View
        style={[
          styles.bellLip,
          {backgroundColor: color, width: size * 0.72, height: 2},
        ]}
      />
      <View
        style={[
          styles.bellClapper,
          {backgroundColor: color, width: size * 0.12, height: size * 0.12},
        ]}
      />
    </Canvas>
  );
}

export function MailMiniIcon({color = colors.onPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.mailBody,
          {borderColor: color, width: size * 0.78, height: size * 0.54},
        ]}
      />
      <View
        style={[
          styles.mailFlap,
          {
            borderBottomColor: color,
            borderLeftWidth: size * 0.22,
            borderRightWidth: size * 0.22,
            borderBottomWidth: size * 0.18,
            top: size * 0.18,
          },
        ]}
      />
    </Canvas>
  );
}

export function LogoutMiniIcon({color = colors.danger, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.logoutBox,
          {borderColor: color, width: size * 0.55, height: size * 0.7},
        ]}
      />
      <View
        style={[
          styles.logoutArrow,
          {borderColor: color, width: size * 0.28, height: size * 0.28},
        ]}
      />
    </Canvas>
  );
}

export function CardsMiniIcon({
  color = colors.onPrimary,
  size = 16,
}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.cardBack,
          {borderColor: color, width: size * 0.62, height: size * 0.46},
        ]}
      />
      <View
        style={[
          styles.cardFront,
          {borderColor: color, width: size * 0.62, height: size * 0.46},
        ]}
      />
    </Canvas>
  );
}

export function CubeMiniIcon({color = colors.onPrimary, size = 16}: IconProps) {
  return <BoxIcon color={color} size={size} />;
}

export function DollarIcon({color = colors.textPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <Text style={[styles.dollar, {color, fontSize: size * 0.86, lineHeight: size}]}>
        $
      </Text>
    </Canvas>
  );
}

export function SparkleIcon({color = colors.primary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.sparkle,
          {
            backgroundColor: color,
            width: size * 0.42,
            height: size * 0.42,
          },
        ]}
      />
      <View
        style={[
          styles.sparkle,
          styles.sparkleSmall,
          {
            backgroundColor: color,
            width: size * 0.22,
            height: size * 0.22,
          },
        ]}
      />
    </Canvas>
  );
}

export function MicIcon({color = colors.textPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.micHead,
          {
            borderColor: color,
            width: size * 0.36,
            height: size * 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.micStand,
          {backgroundColor: color, width: size * 0.08, height: size * 0.18},
        ]}
      />
    </Canvas>
  );
}

export function SendIcon({color = colors.onPrimary, size = 16}: IconProps) {
  return (
    <Canvas size={size}>
      <View
        style={[
          styles.sendWing,
          {
            borderBottomColor: color,
            borderLeftWidth: size * 0.28,
            borderRightWidth: size * 0.28,
            borderBottomWidth: size * 0.34,
          },
        ]}
      />
    </Canvas>
  );
}

export function ChevronDownIcon({
  color = colors.textMuted,
  size = 8,
}: IconProps) {
  return (
    <View
      style={[
        styles.chevronDown,
        {width: size, height: size, borderColor: color},
      ]}
    />
  );
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownBand: {
    position: 'absolute',
    bottom: 1,
    height: 2.5,
    borderRadius: 1,
  },
  crownPoints: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    marginBottom: 3,
  },
  crownPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  crownPointTall: {
    borderBottomWidth: 7,
  },
  menuLine: {
    height: 2,
    borderRadius: 1,
    alignSelf: 'flex-start',
  },
  moon: {
    borderRadius: 20,
    borderWidth: 1.6,
  },
  moonCut: {
    position: 'absolute',
    borderRadius: 20,
  },
  sun: {
    borderRadius: 20,
  },
  questionMark: {
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  searchRing: {
    borderWidth: 1.7,
    borderRadius: 20,
    marginRight: 3,
    marginBottom: 3,
  },
  searchHandle: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    transform: [{rotate: '40deg'}],
  },
  filterTop: {
    height: 2.2,
    borderRadius: 1,
  },
  filterMid: {
    height: 2.2,
    borderRadius: 1,
  },
  closeBar: {
    position: 'absolute',
    height: 1.8,
    borderRadius: 1,
  },
  dot: {
    width: 3.2,
    height: 3.2,
    borderRadius: 2,
  },
  chevron: {
    borderRightWidth: 2,
    borderTopWidth: 2,
    transform: [{rotate: '45deg'}],
  },
  building: {
    borderWidth: 1.6,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  windowRow: {
    flexDirection: 'row',
    gap: 2,
  },
  window: {
    width: 3,
    height: 3,
    borderRadius: 0.5,
  },
  layer: {
    borderWidth: 1.6,
    borderRadius: 2,
  },
  box: {
    borderWidth: 1.7,
    borderRadius: 3,
  },
  calendar: {
    borderWidth: 1.6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  calendarBar: {
    height: 4,
  },
  document: {
    borderWidth: 1.6,
    borderRadius: 2,
  },
  caseHandle: {
    borderWidth: 1.4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  caseBody: {
    borderRadius: 2,
    marginTop: 1,
  },
  folderTab: {
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    alignSelf: 'flex-start',
    marginLeft: 2,
  },
  folderBody: {
    borderRadius: 2,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userHead: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  userBody: {
    marginTop: 1.5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomWidth: 8,
    marginBottom: 1,
  },
  homeBody: {
    borderWidth: 1.6,
    borderRadius: 1,
  },
  gridWrap: {
    width: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
  },
  gridCell: {
    borderRadius: 1.5,
  },
  profileHead: {
    borderRadius: 20,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2.5,
  },
  chartBar: {
    borderRadius: 1.5,
  },
  eye: {
    borderWidth: 1.6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    borderRadius: 6,
  },
  pencil: {
    borderRadius: 1,
    transform: [{rotate: '-35deg'}],
  },
  copyBack: {
    position: 'absolute',
    top: 1,
    left: 1,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  copyFront: {
    marginTop: 3,
    marginLeft: 3,
    borderWidth: 1.5,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  trashLid: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
  },
  trashBody: {
    borderWidth: 1.5,
    borderRadius: 2,
  },
  clock: {
    borderWidth: 1.6,
    borderRadius: 20,
  },
  check: {
    borderLeftWidth: 1.8,
    borderBottomWidth: 1.8,
    transform: [{rotate: '-45deg'}],
    marginTop: -2,
  },
  plusH: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  plusV: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
  },
  globe: {
    borderWidth: 1.6,
    borderRadius: 20,
  },
  shield: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  listLine: {
    height: 2,
    borderRadius: 1,
  },
  bellDome: {
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 1,
  },
  bellLip: {
    borderRadius: 1,
  },
  bellClapper: {
    borderRadius: 6,
    marginTop: 1.5,
  },
  mailBody: {
    borderWidth: 1.6,
    borderRadius: 2,
  },
  mailFlap: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  logoutBox: {
    borderWidth: 1.5,
    borderRadius: 2,
    marginRight: 4,
  },
  logoutArrow: {
    position: 'absolute',
    right: 0,
    borderRightWidth: 1.6,
    borderTopWidth: 1.6,
    transform: [{rotate: '45deg'}],
  },
  cardBack: {
    position: 'absolute',
    top: 1,
    left: 1,
    borderWidth: 1.4,
    borderRadius: 2,
  },
  cardFront: {
    marginTop: 4,
    marginLeft: 3,
    borderWidth: 1.4,
    borderRadius: 2,
  },
  dollar: {
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  sparkle: {
    transform: [{rotate: '45deg'}],
    borderRadius: 1,
  },
  sparkleSmall: {
    position: 'absolute',
    top: 1,
    right: 1,
  },
  micHead: {
    borderWidth: 1.6,
    borderRadius: 10,
    marginBottom: 1,
  },
  micStand: {
    borderRadius: 1,
  },
  sendWing: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{rotate: '90deg'}],
  },
  chevronDown: {
    borderRightWidth: 1.8,
    borderBottomWidth: 1.8,
    transform: [{rotate: '45deg'}],
    marginTop: -3,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyHead: {
    borderWidth: 1.7,
    borderRadius: 20,
  },
  keyShaft: {
    borderRadius: 1,
    marginLeft: -1,
  },
  keyBit: {
    position: 'absolute',
    right: 1,
    bottom: 2,
    borderRadius: 1,
  },
});
