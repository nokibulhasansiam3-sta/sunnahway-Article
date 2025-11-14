<template>
  <div class="card">
    <div class="card-header flex items-center justify-between">
      <div>Articles</div>
      <div class="text-xs text-slate-500">Create and manage articles</div>
    </div>
    <div class="card-body space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="label">Filter by Category</label>
          <select class="input" v-model="selectedCategory">
            <option value="">All</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.id }} — {{ c.titleBn || c.titleEn }}</option>
          </select>
        </div>
        <div class="md:col-span-2 flex items-end justify-between gap-3">
          <div class="flex-1">
            <label class="label">Search</label>
            <input class="input" v-model="query" placeholder="Search by title, id or category" />
          </div>
          <button class="btn btn-primary h-10 mt-[22px]" @click="newArticle">New Article</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="md:col-span-1">
          <div class="card">
            <div class="card-header flex items-center justify-between">
              <div>List</div>
              <div class="text-xs text-slate-500">{{ filteredList.length }} items</div>
            </div>
            <div class="card-body p-0">
              <div v-if="loadingList" class="p-4 text-slate-500">Loading articles…</div>
              <div v-else-if="filteredList.length === 0" class="p-4 text-slate-500">No articles found.</div>
              <div v-else class="p-3 space-y-2">
                <button
                  v-for="a in filteredList"
                  :key="a.id"
                  class="w-full text-left px-4 py-3 rounded-lg border transition shadow-sm hover:shadow bg-white"
                  :class="{ 'border-indigo-300 ring-2 ring-indigo-200': a.id === current?.id }"
                  @click="openArticle(a.id)"
                >
                  <div class="font-medium truncate">{{ a.titleBn || a.titleEn || a.id }}</div>
                  <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span class="truncate">{{ a.id }}</span>
                    <span>•</span>
                    <span class="badge">{{ a.categoryId || 'no-category' }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="md:col-span-2">
          <div class="card" v-if="current">
            <div class="card-header flex items-center justify-between">
              <div>Editor</div>
              <div class="space-x-2">
                <button class="btn btn-outline" @click="removeCurrent">Delete</button>
                <button class="btn btn-primary" @click="saveCurrent">Save</button>
              </div>
            </div>
            <div class="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Title (BN)</label>
                <input class="input" v-model="current.titleBn" />
              </div>
              <div>
                <label class="label">Title (EN)</label>
                <input class="input" v-model="current.titleEn" />
              </div>
              <div>
                <label class="label">Title (AR)</label>
                <input class="input" dir="rtl" v-model="current.titleAr" />
              </div>
              <div>
                <label class="label">Category</label>
                <select class="input" v-model="current.categoryId">
                  <option :value="''">No category</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.id }} — {{ c.titleBn || c.titleEn }}</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="label">Content (BN)</label>
                <textarea class="textarea" v-model="current.contentBn" />
              </div>
              <div class="md:col-span-2">
                <label class="label">Content (EN)</label>
                <textarea class="textarea" v-model="current.contentEn" />
              </div>
              <div class="md:col-span-2">
                <label class="label">Content (AR)</label>
                <textarea class="textarea" dir="rtl" v-model="current.contentAr" />
              </div>
              <div class="md:col-span-2 text-xs text-slate-500">
                <span v-if="!current.titleBn && !current.titleEn" class="text-rose-600">Provide at least BN or EN title.</span>
              </div>
            </div>
          </div>
          <div v-else class="text-slate-500">Select an article from the list or click New Article.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { createArticle, deleteArticle, getArticle, listArticles, listCategories, updateArticle, type Article, type Category } from '../api'
import { useToast } from '../useToast'

const categories = ref<Category[]>([])
const selectedCategory = ref('')
const list = ref<Article[]>([])
const current = ref<Partial<Article> | null>(null)
const loadingList = ref(false)
const toast = useToast()

async function refreshList() {
  loadingList.value = true
  try {
    list.value = await listArticles(selectedCategory.value || undefined)
  } catch (e: any) {
    toast.show('API unreachable. Start server on http://localhost:8081', 'error')
  } finally {
    loadingList.value = false
  }
}

onMounted(async () => {
  categories.value = await listCategories()
  await refreshList()
})

watch(selectedCategory, refreshList)

function newArticle() {
  current.value = { id: '', titleBn: '', titleEn: '', titleAr: '', contentBn: '', contentEn: '', contentAr: '', categoryId: selectedCategory.value || '' }
}

async function openArticle(id: string) {
  try {
    current.value = await getArticle(id)
  } catch (e: any) {
    toast.show(e?.message || 'Failed to load article', 'error')
  }
}

async function saveCurrent() {
  if (!current.value) return
  if (!current.value.titleBn && !current.value.titleEn) {
    toast.show('Provide at least BN or EN title', 'error')
    return
  }
  try {
    if (!current.value.id) {
      const created = await createArticle(current.value)
      await refreshList()
      current.value = created
      toast.show('Article created', 'success')
    } else {
      const updated = await updateArticle(current.value.id, current.value)
      await refreshList()
      current.value = updated
      toast.show('Article saved', 'success')
    }
  } catch (e: any) {
    toast.show(e?.message || 'Save failed', 'error')
  }
}

async function removeCurrent() {
  if (!current.value || !current.value.id) return
  if (!confirm('Delete this article?')) return
  try {
    await deleteArticle(current.value.id)
    await refreshList()
    current.value = null
    toast.show('Article deleted', 'success')
  } catch (e: any) {
    toast.show(e?.message || 'Delete failed', 'error')
  }
}
</script>
