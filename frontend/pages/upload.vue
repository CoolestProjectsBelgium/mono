<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('Upload Movie') }}</h1>
    <UploadAttachments
      ref="uploadRef"
      class="mt-6"
      @upload-start="uploading = true"
      @upload-end="uploading = false"
    />
    <p v-if="uploading" class="mt-4 text-amber-700" role="alert">
      {{ $t('upload.leaveWarning') }}
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'authenticated' })

const uploading = ref(false)
const uploadRef = ref<{ uploading: boolean } | null>(null)

onBeforeRouteLeave((_to, _from, next) => {
  if (uploading.value) {
    const leave = window.confirm('Upload in progress. Leave anyway?')
    next(leave)
  }
  else {
    next()
  }
})
</script>
