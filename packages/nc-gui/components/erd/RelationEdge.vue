<script lang="ts" setup>
import type { EdgeProps, Position } from '@vue-flow/core'
import { EdgeText, getBezierPath } from '@vue-flow/core'
import type { CSSProperties } from '@vue/runtime-dom'
import type { EdgeData } from './utils'
import { computed, toRef } from '#imports'

interface RelationEdgeProps extends EdgeProps<EdgeData> {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  data: EdgeData
  style: CSSProperties
  selected?: boolean
  showSkeleton: boolean
  markerEnd: string
  events: EdgeProps['events']
  sourceNode: EdgeProps['sourceNode']
  targetNode: EdgeProps['targetNode']
}

const props = defineProps<RelationEdgeProps>()

const baseStroke = 2

const data = toRef(props, 'data')

const isHovering = ref(false)

const edgePath = computed(() => {
  if (data.value.isSelfRelation) {
    const { sourceX, sourceY, targetX, targetY } = props
    const radiusX = (sourceX - targetX) * 0.6
    const radiusY = 50
    return [`M ${sourceX} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX} ${targetY}`, NaN, NaN] as const
  }

  return getBezierPath({ ...props })
})

props.events?.mouseEnter?.(() => {
  isHovering.value = true
})

props.events?.mouseLeave?.(() => {
  isHovering.value = false
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <defs>
    <linearGradient id="linear-gradient" x1="-28.83" y1="770.92" x2="771.05" y2="-28.95" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#06b6d4" />
      <stop offset="0.18" stop-color="#155e75" />
      <stop offset="0.49" stop-color="#84cc16" />
      <stop offset="0.88" stop-color="#10b981" />
      <stop offset="0.99" stop-color="#047857" />
    </linearGradient>
  </defs>

  <Transition name="layout" :duration="50" mode="in-out">
    <path
      v-if="selected || isHovering"
      style="stroke: url(#linear-gradient)"
      :stroke-width="(showSkeleton ? baseStroke * 12 : baseStroke * 8) / (selected || isHovering ? 2 : 1)"
      fill="none"
      :d="edgePath[0]"
      :marker-end="showSkeleton ? markerEnd : ''"
    />

    <path
      v-else
      :id="id"
      class="stroke-slate-500"
      :style="style"
      :stroke-width="showSkeleton ? baseStroke * 4 : baseStroke"
      fill="none"
      :d="edgePath[0]"
      :marker-end="showSkeleton ? markerEnd : ''"
    />
  </Transition>

  <path class="opacity-0" :stroke-width="showSkeleton ? baseStroke * 12 : baseStroke * 8" fill="none" :d="edgePath[0]" />

  <Transition name="layout">
    <EdgeText
      v-if="data.label?.length && data.label.length > 0"
      :key="`edge-text-${id}.${showSkeleton}`"
      class="color-transition"
      :class="[
        selected || isHovering ? 'opacity-100' : 'opacity-0 !pointer-events-none',
        showSkeleton ? '!text-6xl' : '!text-xs',
        `nc-erd-table-label-${data.label.toLowerCase().replace(' ', '-').replace('\(', '').replace(')', '')}`,
      ]"
      :x="edgePath[1]"
      :y="edgePath[2]"
      :label="showSkeleton ? data.simpleLabel : data.label"
      :label-style="{ fill: 'white', fontSize: `${showSkeleton ? baseStroke * 2 : baseStroke / 2}rem` }"
      :label-show-bg="true"
      :label-bg-style="{ fill: data.color }"
      :label-bg-padding="[8, 6]"
      :label-bg-border-radius="2"
    />
  </Transition>

  <template v-if="!showSkeleton">
    <rect
      class="nc-erd-edge-rect"
      :x="sourceX"
      :y="sourceY - 4"
      :width="8"
      :height="8"
      fill="#fff"
      :stroke="sourceNode.data.color"
      :stroke-width="2"
      :transform="`rotate(45,${sourceX + 2},${sourceY - 4})`"
    />

    <rect
      v-if="data.isManyToMany"
      class="nc-erd-edge-rect"
      :x="targetX"
      :y="targetY - 4"
      :width="8"
      :height="8"
      fill="#fff"
      :stroke="sourceNode.data.color"
      :stroke-width="2"
      :transform="`rotate(45,${targetX + 2},${targetY - 4})`"
    />
    <circle
      v-else
      class="nc-erd-edge-circle"
      :cx="targetX"
      :cy="targetY"
      fill="#fff"
      :r="5"
      :stroke="targetNode.data.color"
      :stroke-width="2"
    />
  </template>
</template>
