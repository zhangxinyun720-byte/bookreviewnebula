<script setup>
import { siteText } from '@/config/site'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: true },
  max: { type: Number, default: 5 }
})
const emit = defineEmits(['update:modelValue'])

function setStar(n) {
  if (props.readonly) return
  emit('update:modelValue', props.modelValue === n ? n - 1 : n)
}
</script>

<template>
  <div class="stars" :class="{ interactive: !readonly }">
    <button
      v-for="n in max"
      :key="n"
      type="button"
      class="star"
      :class="{ filled: n <= modelValue }"
      :disabled="readonly"
      :aria-label="siteText.star.ariaLabel(n)"
      @click="setStar(n)"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.1 1.13-6.57-4.78-4.66 6.6-.96L12 2.5z"
          :fill="n <= modelValue ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.4"
        />
      </svg>
    </button>
    <span v-if="!readonly" class="star-hint muted">{{ modelValue }} / {{ max }}</span>
  </div>
</template>

<style scoped>
.stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  color: var(--accent);
}
.star {
  display: grid;
  place-items: center;
  padding: 2px;
  line-height: 0;
}
.star:disabled { cursor: default; }
.stars.interactive .star { cursor: pointer; }
.stars.interactive .star:hover svg { transform: scale(1.15); }
.star svg { transition: transform 0.15s ease; }
.star.filled { color: var(--accent); }
.star:not(.filled) { color: var(--border); }
.star-hint { margin-left: 8px; font-size: 0.8rem; }
</style>
