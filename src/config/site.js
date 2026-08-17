export const siteText = {
  site: {
    brandMark: '读',
    brandName: 'Reading Notes',
  },

  nav: {
    home: '书架',
    admin: '管理',
    login: '登录',
    logout: '退出',
    menuLabel: '菜单',
  },

  footer: {
    copyright: (year) => `© ${year} Reading Notes · 记录每一本书的阅读感悟`,
    builtWith: 'Built with Vue & Supabase',
  },

  home: {
    eyebrow: "Nebula's book review · 一支秃笔",
    title: '知不可乎骤得',
    accent: '吾将上下而求索',
    subtitle: '这里记录我读过的书——与你同行亦是我最大的荣幸',
    loading: '正在加载书架…',
    empty: '这个分类下还没有书籍。',
  },

  filter: {
    all: '全部',
  },

  bookDetail: {
    back: '← 返回书架',
    loading: '加载中…',
    author: '作者 · ',
    review: '书评',
    edit: '编辑',
    notFound: '没有找到这本书。',
    backHome: '回到书架',
  },

  login: {
    title: '管理登录',
    subtitle: '使用你的管理员账号登录后台',
    email: '邮箱',
    password: '密码',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '••••••••',
    button: '登录',
    buttonLoading: '登录中…',
    error: '邮箱或密码不正确，请重试。',
  },

  admin: {
    layout: {
      title: '管理后台',
      books: '书籍管理',
      categories: '分类管理',
      backToSite: '← 返回前台',
      logout: '退出登录',
    },

    books: {
      title: '书籍管理',
      newButton: '+ 新建书评',
      searchPlaceholder: '搜索书名或作者…',
      headers: {
        title: '书名',
        author: '作者',
        category: '分类',
        rating: '评分',
        status: '状态',
        actions: '操作',
      },
      status: {
        draft: '草稿',
        published: '已发布',
      },
      empty: '还没有书籍，点击「新建书评」开始吧。',
      confirmDelete: (title) => `确定删除《${title}》吗？此操作不可撤销。`,
    },

    bookForm: {
      newTitle: '新建书评',
      editTitle: '编辑书评',
      back: '← 返回列表',
      fields: {
        title: '书名 *',
        cover: '封面图片',
        rating: '个人评分',
        review: '书评',
        author: '作者',
        category: '分类',
        uncategorized: '未分类',
        summary: '摘要',
        status: '发布状态',
        publish: '发布',
        draft: '草稿',
        more: '更多选项',
        less: '收起',
      },
      upload: {
        selectFile: '选择图片',
        uploading: '上传中…',
        uploadSuccess: '上传成功',
        uploadFailed: '上传失败，请重试',
        fileTooLarge: '图片不能超过 5MB',
        invalidType: '请选择 JPG 或 PNG 图片',
        replace: '替换',
        remove: '移除',
        orPasteUrl: '或粘贴图片链接',
        preview: '图片预览',
      },
      placeholders: {
        title: '例如：思考，快与慢',
        cover: '粘贴封面图链接，留空则显示默认封面',
        review: '写下你的阅读感悟与思考…',
        author: '例如：丹尼尔·卡尼曼',
        summary: '一两句话概括这本书…',
      },
      actions: {
        cancel: '取消',
        create: '创建书评',
        save: '保存修改',
        saving: '保存中…',
      },
      errors: {
        titleRequired: '请填写书名。',
        saveFailed: '保存失败，请重试。',
        notFound: '未找到该书。',
      },
    },

    categories: {
      title: '分类管理',
      newButton: '+ 新建分类',
      newFormTitle: '新建分类',
      editFormTitle: '编辑分类',
      fields: {
        name: '名称 *',
        slug: 'Slug（URL 标识）',
        description: '描述',
        sortOrder: '排序（数字越小越靠前）',
      },
      placeholders: {
        name: '例如：心理学',
        slug: 'psychology',
        description: '分类的简短说明',
      },
      actions: {
        cancel: '取消',
        save: '保存',
      },
      errors: {
        nameRequired: '请填写分类名称。',
        saveFailed: '保存失败，可能 slug 已存在。',
      },
      bookCount: (n) => `${n} 本`,
      confirmDelete: (name, count) =>
        count
          ? `分类「${name}」下有 ${count} 本书，删除后这些书将变为未分类。确定继续吗？`
          : `确定删除分类「${name}」吗？`,
      empty: '还没有分类，点击「新建分类」开始吧。',
      loading: '加载中…',
    },
  },

  star: {
    ariaLabel: (n) => `${n} 星`,
  },
}
