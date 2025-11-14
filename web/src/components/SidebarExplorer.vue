<template>
  <div class="card h-full">
    <div class="card-header flex items-center justify-between">
      <div>Explorer</div>
      <div class="text-xs text-slate-500">{{ totalCount }} items</div>
    </div>
    <div class="card-body space-y-3">
      <div class="flex gap-2">
        <input class="input flex-1" v-model="query" placeholder="Search (title/id)" />
        <button class="btn btn-outline" @click="$emit('newRoot')">New</button>
      </div>
      <div class="space-y-3 max-h-[70vh] overflow-auto pr-1">
        <div v-for="cat in categories" :key="cat.id" class="border rounded-lg">
          <button class="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50" @click="toggle(cat.id)">
            <div class="flex items-center gap-2">
              <span class="badge">{{ cat.id }}</span>
              <span class="text-sm">{{ cat.titleBn || cat.titleEn }}</span>
            </div>
            <div class="text-xs text-slate-500">
              <span v-if="loadingSet.has(cat.id)">loading…</span>
              <span v-else>{{ counts[cat.id] ?? 0 }} items</span>
            </div>
          </button>
          <div v-show="open.has(cat.id)" class="p-2 space-y-1">
            <div class="flex items-center gap-2 px-2 pb-2">
              <input class="input flex-1" v-model="localFilter[cat.id]" placeholder="Filter in {{cat.id}}" />
              <button class="btn btn-primary" @click="$emit('newIn', cat.id)">New</button>
            </div>
            <div v-if="loadingSet.has(cat.id)" class="text-slate-500 text-sm px-2">Loading…</div>
            <button v-else v-for="a in filtered(cat.id)" :key="a.id" @click="$emit('select', a.id)"
              class="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 border">
              <div class="font-medium truncate">{{ a.titleBn || a.titleEn || a.id }}</div>
              <div class="text-xs text-slate-500 truncate">{{ a.id }} • {{ a.categoryId || 'no-category' }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listArticles, listCategories, type Article, type Category } from '../api'

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'newIn', categoryId: string): void
  (e: 'newRoot'): void
}>()

const categories = ref<Category[]>([])
const articlesMap = reactive<Record<string, Article[] | undefined>>({})
const counts = reactive<Record<string, number>>({})
const open = ref<Set<string>>(new Set())
const query = ref('')
const localFilter = reactive<Record<string, string>>({})
const totalCount = ref(0)
const loadingSet = ref<Set<string>>(new Set())

async function toggle(id: string) {
  if (open.value.has(id)) { open.value.delete(id); return }
  open.value.add(id)
  if (!articlesMap[id]) {
    loadingSet.value.add(id)
    try {
      const items = await listArticles(id)
      articlesMap[id] = items
      counts[id] = items.length
      totalCount.value = Object.values(counts).reduce((a,b)=>a+(b||0),0)
    } finally {
      loadingSet.value.delete(id)
    }
  }
}

function filtered(catId: string) {
  const items = (articlesMap[catId] || [])
  const q = (localFilter[catId] || query.value || '').toLowerCase().trim()
  if (!q) return items
  return items.filter(a => (
    (a.titleBn || '').toLowerCase().includes(q) ||
    (a.titleEn || '').toLowerCase().includes(q) ||
    (a.id || '').toLowerCase().includes(q)
  ))
}

onMounted(async () => {
  categories.value = await listCategories()
})
</script>
