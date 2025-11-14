<template>
  <div class="card">
    <div class="card-header">Articles</div>
    <div class="card-body space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Filter by Category</label>
          <select class="input" v-model="selectedCategory">
            <option value="">All</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.id }} — {{ c.titleBn || c.titleEn }}</option>
          </select>
        </div>
        <div class="md:col-span-2 flex items-end justify-end gap-3">
          <button class="btn btn-outline" @click="newArticle">New Article</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="md:col-span-1">
          <div class="card">
            <div class="card-header">List</div>
            <div class="card-body p-0 divide-y">
              <button
                v-for="a in list"
                :key="a.id"
                class="w-full text-left px-4 py-3 hover:bg-slate-50"
                :class="{ 'bg-slate-100': a.id === current?.id }"
                @click="openArticle(a.id)"
              >
                <div class="font-medium">{{ a.titleBn || a.titleEn || a.id }}</div>
                <div class="text-xs text-slate-500">{{ a.id }} • {{ a.categoryId || 'no-category' }}</div>
              </button>
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
                <input class="input" v-model="current.categoryId" placeholder="category id" />
                <p class="helper">Type an existing category id</p>
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
            </div>
          </div>
          <div v-else class="text-slate-500">Select an article from the list or click New Article.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { createArticle, deleteArticle, getArticle, listArticles, listCategories, updateArticle, type Article, type Category } from '../api'

const categories = ref<Category[]>([])
const selectedCategory = ref('')
const list = ref<Article[]>([])
const current = ref<Partial<Article> | null>(null)

async function refreshList() {
  list.value = await listArticles(selectedCategory.value || undefined)
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
  current.value = await getArticle(id)
}

async function saveCurrent() {
  if (!current.value) return
  if (!current.value.id) {
    const created = await createArticle(current.value)
    await refreshList()
    current.value = created
  } else {
    const updated = await updateArticle(current.value.id, current.value)
    await refreshList()
    current.value = updated
  }
}

async function removeCurrent() {
  if (!current.value || !current.value.id) return
  if (!confirm('Delete this article?')) return
  await deleteArticle(current.value.id)
  await refreshList()
  current.value = null
}
</script>
