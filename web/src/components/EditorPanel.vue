<template>
  <div class="card h-full">
    <div class="card-header flex items-center justify-between">
      <div>Editor</div>
      <div class="space-x-2">
        <button class="btn btn-outline" :disabled="!current?.id" @click="onDelete">Delete</button>
        <button class="btn btn-primary" @click="onSave">Save</button>
      </div>
    </div>
    <div class="card-body" v-if="current">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div v-else class="card-body text-slate-500">Select an item from the Explorer or click New.</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { createArticle, deleteArticle, getArticle, listCategories, updateArticle, type Article, type Category } from '../api'
import { useToast } from '../useToast'

const props = defineProps<{ selectedId: string | null, draftCategoryId?: string | null }>()
const emit = defineEmits<{ (e:'saved', id:string): void, (e:'deleted'): void }>()

const categories = ref<Category[]>([])
const current = ref<Partial<Article> | null>(null)
const toast = useToast()

onMounted(async () => { categories.value = await listCategories() })

watch(() => props.selectedId, async (id) => {
  if (!id) { current.value = null; return }
  try {
    current.value = await getArticle(id)
  } catch (e:any) {
    toast.show(e?.message || 'Failed to load article', 'error')
  }
}, { immediate: true })

watch(() => props.draftCategoryId, (cid) => {
  if (cid === undefined) return
  if (!props.selectedId) {
    current.value = { id: '', categoryId: cid || '', titleBn: '', titleEn: '', titleAr: '', contentBn: '', contentEn: '', contentAr: '' }
  }
}, { immediate: true })

async function onSave() {
  if (!current.value) return
  if (!current.value.titleBn && !current.value.titleEn) {
    toast.show('Provide at least BN or EN title', 'error')
    return
  }
  try {
    if (!current.value.id) {
      const created = await createArticle(current.value)
      current.value = created
      toast.show('Article created', 'success')
      emit('saved', created.id)
    } else {
      const updated = await updateArticle(current.value.id, current.value)
      current.value = updated
      toast.show('Article saved', 'success')
      emit('saved', updated.id)
    }
  } catch (e:any) {
    toast.show(e?.message || 'Save failed', 'error')
  }
}

async function onDelete() {
  if (!current.value || !current.value.id) return
  if (!confirm('Delete this article?')) return
  try {
    await deleteArticle(current.value.id)
    current.value = null
    toast.show('Article deleted', 'success')
    emit('deleted')
  } catch (e:any) {
    toast.show(e?.message || 'Delete failed', 'error')
  }
}
</script>
