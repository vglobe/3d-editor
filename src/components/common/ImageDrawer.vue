<template>
  <a-drawer
    :title="t('选择图片')"
    placement="right"
    :closable="false"
    :visible="visible"
    @close="close"
  >
    <div class="buttons">
      <a-upload
        v-if="uploadUrl"
        :action="uploadUrl"
        :data="uploadParams"
        :headers="uploadHeaders"
        listType="picture"
        :showUploadList="false"
        @change="imageChange"
      >
        <a-button type="primary">{{ t('上传图片') }}</a-button>
      </a-upload>

      <a-button type="primary" @click="modalVisible = true">{{
        t('在线图片')
      }}</a-button>
    </div>
    <div class="images">
      <div class="imageItem" v-for="(item, index) in images" :key="index">
        <img
          :src="item.image"
          :draggable="true"
          @click="onSelectImage(item.image)"
          @touchstart="onSelectImage(item.image)"
        />
        <i
          class="t-icon t-close"
          @click.stop="onDelImg(item.image, index)"
          :title="t('从图库中移除，但不删除图片')"
        ></i>
      </div>
    </div>
  </a-drawer>

  <a-modal
    v-model:visible="modalVisible"
    :title="t('图片URL')"
    :cancelText="t('取消')"
    :okText="t('确定')"
    @ok="addImgUrl"
  >
    <a-input v-model:value="imgUrl" />
  </a-modal>
</template>
<script lang="ts">
import axios from 'axios';
import { t } from '@/i18n/i18n';
import { getCookie } from '@/services/cookie';
import { addImageUrl } from '@/services/file';
import { message } from 'ant-design-vue';
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
export default defineComponent({
  props: {
    visible: Boolean,
  },
  emits: ['chooseImage', 'update:visible'],
  setup(props, { emit }) {
    function close() {
      emit('update:visible', false);
    }

    const store = useStore();
    const user = computed(() => store.state.user.profile);

    const images = ref([]);
    // getImages();

    async function getImages() {
      if (!user) {
        return [];
      }
      const result: { list: any[] } = await axios.get(
        '/api/user/component/images',
        {
          params: { pageIndex: 1, pageCount: 1000 },
        }
      );

      images.value = result.list || [];
    }

    function onSelectImage(image: string) {
      emit('chooseImage', image);
      close();
    }

    function onDelImg(image: string, i: number) {
      this.images.splice(i, 1);
      axios.post('/api/user/component/image/delete', {
        image,
      });
    }

    // 上传操作  TODO: 待抽取
    const uploadUrl = '/api/image';
    const uploadHeaders = {
      Authorization: getCookie('token') || '',
    };
    const uploadParams = {
      randomName: 1,
      public: true,
    };

    async function imageChange(info: any) {
      message.loading({
        content: t('图片上传中...').toString(),
        key: 'uploadingImage',
      });
      if (info.file.status === 'done') {
        message.success({
          content: t('图片上传成功！').toString(),
          key: 'uploadingImage',
          duration: 3,
        });
        // 上传图片
        addUserImageUrl(info.file.response.url);
        emit('chooseImage', info.file.response.url);
      } else if (info.file.status === 'error') {
        message.error({
          content: t('图片上传失败，请稍后重试').toString(),
          key: 'uploadingImage',
          duration: 2,
        });
      }
    }

    async function addUserImageUrl(url: any) {
      if (!(user.value && user.value.username)) {
        message.warn('请先登录，否则无法保存!');
      } else {
        (await addImageUrl(url)) && getImages();
      }
    }

    const modalVisible = ref(false);
    const imgUrl = ref('');

    function addImgUrl() {
      if (!imgUrl.value) {
        message.error(t('请填写URL').toString());
        return;
      }
      modalVisible.value = false;
      addUserImageUrl(imgUrl.value);
    }

    return {
      close,
      images,
      onSelectImage,
      onDelImg,
      uploadUrl,
      uploadHeaders,
      uploadParams,
      imageChange,
      modalVisible,
      imgUrl,
      addImgUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.images {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  .imageItem {
    position: relative;

    &:hover {
      i {
        display: block;
      }
    }

    img {
      width: 100%;
      height: 100%;
    }

    i {
      position: absolute;
      right: 3px;
      top: 3px;
      display: none;
    }
  }
}
</style>
