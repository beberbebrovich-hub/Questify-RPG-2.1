const { Plugin, ItemView, Modal, Notice, Setting } = require("obsidian");

const VIEW_TYPE = "questify-rpg-view";
const XP_REWARD = 10;

const DEFAULT_DATA = {
  username: "Путешественник",
  avatar: "✦",
  totalXp: 0,
  quests: [],
  achievements: []
};

const DAILY_QUEST_TEMPLATES = [
  { id: "walk", title: "Ходьба", description: "Пройти заданное количество шагов за день", unit: "шагов", base: 15000, step: 500, skill: "exploration" },
  { id: "reader", title: "Читатель", description: "Прочитать заданное количество абзацев из любой книги", unit: "абзацев", base: 5, step: 1, skill: "intelligence" },
  { id: "water", title: "Водный баланс", description: "Выпить заданное количество стаканов воды", unit: "стаканов", base: 6, step: 1, skill: "discipline" },
  { id: "stretch", title: "Разминка", description: "Сделать короткую разминку", unit: "минут", base: 10, step: 2, skill: "discipline" },
  { id: "journal", title: "Дневник", description: "Записать мысли и итоги дня", unit: "предложений", base: 5, step: 1, skill: "creativity" },
  { id: "learn", title: "Новое знание", description: "Изучить новую тему или понятие", unit: "минут", base: 15, step: 5, skill: "intelligence" },
  { id: "language", title: "Иностранный язык", description: "Практиковать иностранный язык", unit: "минут", base: 10, step: 2, skill: "intelligence" },
  { id: "coding", title: "Практика кода", description: "Писать или разбирать код", unit: "минут", base: 15, step: 5, skill: "technology" },
  { id: "tidy", title: "Порядок", description: "Навести порядок на рабочем месте", unit: "минут", base: 5, step: 2, skill: "discipline" },
  { id: "meditate", title: "Пауза", description: "Посидеть в тишине или помедитировать", unit: "минут", base: 5, step: 1, skill: "discipline" },
  { id: "pushups", title: "Отжимания", description: "Выполнить отжимания в комфортном темпе", unit: "повторений", base: 5, step: 2, skill: "discipline" },
  { id: "squats", title: "Приседания", description: "Выполнить приседания", unit: "повторений", base: 10, step: 3, skill: "discipline" },
  { id: "stairs", title: "Лестница", description: "Подняться по лестнице вместо лифта", unit: "этажей", base: 3, step: 1, skill: "exploration" },
  { id: "freshair", title: "Свежий воздух", description: "Провести время на свежем воздухе", unit: "минут", base: 10, step: 3, skill: "exploration" },
  { id: "no_social", title: "Цифровая пауза", description: "Провести время без соцсетей", unit: "минут", base: 20, step: 5, skill: "discipline" },
  { id: "focus", title: "Глубокая работа", description: "Поработать без отвлечений", unit: "минут", base: 20, step: 5, skill: "discipline" },
  { id: "notes", title: "Заметки", description: "Создать полезную заметку в Obsidian", unit: "заметок", base: 1, step: 0, skill: "technology" },
  { id: "review", title: "Повторение", description: "Повторить изученный материал", unit: "минут", base: 10, step: 3, skill: "intelligence" },
  { id: "draw", title: "Рисование", description: "Порисовать или сделать набросок", unit: "минут", base: 10, step: 3, skill: "creativity" },
  { id: "photo", title: "Наблюдатель", description: "Сделать интересную фотографию", unit: "кадров", base: 1, step: 0, skill: "creativity" },
  { id: "idea", title: "Генератор идей", description: "Записать новые идеи", unit: "идей", base: 3, step: 1, skill: "creativity" },
  { id: "clean", title: "Чистое пространство", description: "Убрать небольшую зону дома", unit: "минут", base: 10, step: 3, skill: "discipline" },
  { id: "cook", title: "Домашняя еда", description: "Приготовить простое блюдо", unit: "блюд", base: 1, step: 0, skill: "discipline" },
  { id: "plan", title: "Планировщик", description: "Составить план на завтра", unit: "пунктов", base: 3, step: 1, skill: "discipline" },
  { id: "budget", title: "Финансовая грамотность", description: "Проверить расходы или бюджет", unit: "минут", base: 5, step: 2, skill: "intelligence" },
  { id: "read_news", title: "Осознанные новости", description: "Прочитать одну содержательную статью", unit: "статей", base: 1, step: 0, skill: "intelligence" },
  { id: "podcast", title: "Аудиообучение", description: "Послушать образовательный материал", unit: "минут", base: 10, step: 3, skill: "intelligence" },
  { id: "memory", title: "Тренировка памяти", description: "Вспомнить и записать изученное без подсказок", unit: "фактов", base: 3, step: 1, skill: "intelligence" },
  { id: "typing", title: "Скорость печати", description: "Потренировать слепую печать", unit: "минут", base: 5, step: 2, skill: "technology" },
  { id: "shortcut", title: "Горячие клавиши", description: "Выучить полезные сочетания клавиш", unit: "сочетаний", base: 2, step: 1, skill: "technology" },
  { id: "backup", title: "Резервная копия", description: "Сделать резервную копию важного файла", unit: "копий", base: 1, step: 0, skill: "technology" },
  { id: "inbox", title: "Разбор входящих", description: "Разобрать входящие заметки или задачи", unit: "элементов", base: 5, step: 2, skill: "technology" },
  { id: "wiki", title: "Связи знаний", description: "Связать заметки внутренними ссылками", unit: "ссылок", base: 2, step: 1, skill: "technology" },
  { id: "read_code", title: "Чтение кода", description: "Изучить чужой фрагмент кода", unit: "строк", base: 10, step: 5, skill: "technology" },
  { id: "debug", title: "Отладчик", description: "Найти и исправить небольшую ошибку", unit: "ошибок", base: 1, step: 0, skill: "technology" },
  { id: "tutorial", title: "Мини-урок", description: "Пройти часть обучающего урока", unit: "минут", base: 10, step: 3, skill: "technology" },
  { id: "research", title: "Исследователь", description: "Найти ответы на один вопрос", unit: "источников", base: 2, step: 1, skill: "intelligence" },
  { id: "map", title: "Картограф", description: "Изучить новое место на карте", unit: "мест", base: 1, step: 0, skill: "exploration" },
  { id: "route", title: "Новый маршрут", description: "Пройти незнакомым маршрутом", unit: "минут", base: 10, step: 3, skill: "exploration" },
  { id: "nature", title: "Наблюдение", description: "Замечать детали природы вокруг", unit: "наблюдений", base: 3, step: 1, skill: "exploration" },
  { id: "kindness", title: "Доброе дело", description: "Сделать небольшое доброе дело", unit: "дел", base: 1, step: 0, skill: "discipline" },
  { id: "gratitude", title: "Благодарность", description: "Записать то, за что благодарен", unit: "пунктов", base: 3, step: 1, skill: "discipline" },
  { id: "call", title: "На связи", description: "Позвонить близкому человеку", unit: "звонков", base: 1, step: 0, skill: "discipline" },
  { id: "posture", title: "Осанка", description: "Проверять и выравнивать осанку в течение дня", unit: "проверок", base: 4, step: 1, skill: "discipline" },
  { id: "eye_rest", title: "Отдых для глаз", description: "Сделать перерывы от экрана", unit: "перерывов", base: 3, step: 1, skill: "discipline" },
  { id: "sleep_prep", title: "Подготовка ко сну", description: "Подготовиться ко сну без экрана", unit: "минут", base: 15, step: 3, skill: "discipline" },
  { id: "music", title: "Музыка", description: "Послушать музыку внимательно или сыграть", unit: "минут", base: 10, step: 3, skill: "creativity" },
  { id: "write", title: "Письмо", description: "Написать небольшой текст", unit: "слов", base: 100, step: 25, skill: "creativity" },
  { id: "story", title: "Сторителлинг", description: "Придумать короткую историю", unit: "предложений", base: 3, step: 1, skill: "creativity" },
  { id: "design", title: "Дизайн", description: "Создать маленький дизайн-элемент", unit: "элементов", base: 1, step: 0, skill: "creativity" },
  { id: "craft", title: "Ручная работа", description: "Сделать что-то руками", unit: "минут", base: 10, step: 3, skill: "creativity" },
  { id: "mindmap", title: "Карта мыслей", description: "Составить карту мыслей по теме", unit: "веток", base: 4, step: 1, skill: "creativity" },
  { id: "brainstorm", title: "Мозговой штурм", description: "Придумать варианты решения задачи", unit: "вариантов", base: 5, step: 2, skill: "creativity" },
  { id: "organize_files", title: "Файловый порядок", description: "Разобрать файлы или папку", unit: "файлов", base: 5, step: 2, skill: "technology" },
  { id: "learn_feature", title: "Новая функция", description: "Освоить одну функцию используемого приложения", unit: "функций", base: 1, step: 0, skill: "technology" },
  { id: "formula", title: "Математика", description: "Решить несколько математических примеров", unit: "примеров", base: 3, step: 1, skill: "intelligence" },
  { id: "puzzle", title: "Головоломка", description: "Решить логическую задачу", unit: "задач", base: 1, step: 0, skill: "intelligence" },
  { id: "chess", title: "Стратег", description: "Сыграть или разобрать шахматную позицию", unit: "позиций", base: 1, step: 0, skill: "intelligence" },
  { id: "vocab", title: "Словарный запас", description: "Выучить новые слова", unit: "слов", base: 5, step: 2, skill: "intelligence" },
  { id: "summarize", title: "Краткий пересказ", description: "Кратко пересказать прочитанное", unit: "предложений", base: 3, step: 1, skill: "intelligence" },
  { id: "teach", title: "Объясни просто", description: "Объяснить изученную тему своими словами", unit: "минут", base: 3, step: 1, skill: "intelligence" },
  { id: "experiment", title: "Эксперимент", description: "Попробовать новый способ выполнить задачу", unit: "попыток", base: 1, step: 0, skill: "exploration" },
  { id: "museum", title: "Культура", description: "Познакомиться с произведением искусства или историей", unit: "объектов", base: 1, step: 0, skill: "exploration" },
  { id: "language_video", title: "Видео на языке", description: "Посмотреть видео на иностранном языке", unit: "минут", base: 5, step: 2, skill: "intelligence" },
  { id: "recipe", title: "Новый вкус", description: "Попробовать новый рецепт или ингредиент", unit: "попыток", base: 1, step: 0, skill: "creativity" },
  { id: "declutter", title: "Расхламление", description: "Убрать одну ненужную вещь или файл", unit: "предметов", base: 3, step: 1, skill: "discipline" },
  { id: "water_plants", title: "Забота о растениях", description: "Ухаживать за растениями", unit: "минут", base: 3, step: 1, skill: "discipline" },
  { id: "pet", title: "Забота", description: "Уделить время питомцу или близким", unit: "минут", base: 10, step: 3, skill: "discipline" },
  { id: "stairs_walk", title: "Активная пауза", description: "Встать и немного пройтись после сидения", unit: "раз", base: 3, step: 1, skill: "discipline" },
  { id: "balance", title: "Баланс", description: "Выполнить упражнение на равновесие", unit: "секунд", base: 20, step: 5, skill: "discipline" },
  { id: "plank", title: "Планка", description: "Выполнить планку в комфортном темпе", unit: "секунд", base: 20, step: 5, skill: "discipline" },
  { id: "dance", title: "Танец", description: "Потанцевать под любимую музыку", unit: "минут", base: 5, step: 2, skill: "creativity" },
  { id: "mobility", title: "Подвижность", description: "Сделать упражнения на подвижность суставов", unit: "минут", base: 5, step: 2, skill: "discipline" },
  { id: "cycling", title: "Велопрогулка", description: "Покататься на велосипеде или велотренажёре", unit: "минут", base: 10, step: 3, skill: "exploration" },
  { id: "run", title: "Лёгкий бег", description: "Пробежаться или пройтись быстрым шагом", unit: "минут", base: 5, step: 2, skill: "discipline" },
  { id: "swim", title: "Плавание", description: "Поплавать, если есть возможность", unit: "минут", base: 10, step: 3, skill: "discipline" },
  { id: "stairs_extra", title: "Лестничный вызов", description: "Добавить подъём по лестнице в маршрут", unit: "этажей", base: 2, step: 1, skill: "exploration" },
  { id: "sunlight", title: "Дневной свет", description: "Побыть при дневном свете", unit: "минут", base: 10, step: 3, skill: "discipline" },
  { id: "hydration_note", title: "Отметка привычки", description: "Записать наблюдение о самочувствии и привычках", unit: "строк", base: 2, step: 1, skill: "intelligence" },
  { id: "one_task", title: "Главный приоритет", description: "Завершить одну важную задачу дня", unit: "задач", base: 1, step: 0, skill: "discipline" },
  { id: "email", title: "Почтовый разбор", description: "Разобрать письма или сообщения", unit: "сообщений", base: 5, step: 2, skill: "technology" },
  { id: "desk", title: "Рабочая зона", description: "Подготовить рабочее место к работе", unit: "действий", base: 3, step: 1, skill: "discipline" },
  { id: "pomodoro", title: "Помодоро", description: "Провести один фокус-блок", unit: "блоков", base: 1, step: 0, skill: "discipline" },
  { id: "review_week", title: "Итоги", description: "Подвести короткие итоги дня", unit: "пунктов", base: 3, step: 1, skill: "intelligence" },
  { id: "new_word", title: "Слово дня", description: "Узнать значение нового слова", unit: "слов", base: 1, step: 0, skill: "intelligence" },
  { id: "quote", title: "Цитата", description: "Сохранить цитату и написать мысль о ней", unit: "цитат", base: 1, step: 0, skill: "creativity" },
  { id: "sketch", title: "Быстрый скетч", description: "Сделать быстрый набросок", unit: "набросков", base: 1, step: 0, skill: "creativity" },
  { id: "photo_walk", title: "Фотоохота", description: "Найти необычную деталь вокруг", unit: "деталей", base: 2, step: 1, skill: "exploration" },
  { id: "local_history", title: "История места", description: "Узнать один факт о своём городе или районе", unit: "фактов", base: 1, step: 0, skill: "exploration" },
  { id: "declutter_notes", title: "Чистка заметок", description: "Улучшить старую заметку", unit: "заметок", base: 1, step: 0, skill: "technology" },
  { id: "tag_notes", title: "Теги", description: "Добавить полезные теги заметкам", unit: "тегов", base: 3, step: 1, skill: "technology" },
  { id: "template", title: "Шаблон", description: "Создать или улучшить шаблон заметки", unit: "шаблонов", base: 1, step: 0, skill: "technology" },
  { id: "keyboard", title: "Без мыши", description: "Выполнить часть работы с клавиатуры", unit: "минут", base: 5, step: 2, skill: "technology" },
  { id: "read_documentation", title: "Документация", description: "Прочитать часть документации", unit: "минут", base: 5, step: 2, skill: "intelligence" },
  { id: "solve_problem", title: "Решение", description: "Разбить сложную задачу на шаги", unit: "шагов", base: 3, step: 1, skill: "intelligence" },
  { id: "help", title: "Помощник", description: "Помочь кому-то с небольшим делом", unit: "дел", base: 1, step: 0, skill: "discipline" },
  { id: "outside_break", title: "Перерыв на улице", description: "Сделать короткий перерыв на улице", unit: "минут", base: 5, step: 2, skill: "exploration" },
  { id: "quiet", title: "Тишина", description: "Провести время без фонового шума", unit: "минут", base: 5, step: 2, skill: "discipline" },
  { id: "water_clean", title: "Порядок вокруг", description: "Убрать мусор или переработать отходы", unit: "действий", base: 2, step: 1, skill: "discipline" },
  { id: "stretch_walk", title: "Разогрев", description: "Размяться перед длительной работой", unit: "минут", base: 3, step: 1, skill: "discipline" }
]

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function levelInfo(totalXp) {
  let remaining = Math.max(0, Number(totalXp) || 0);
  let level = 1;
  while (remaining >= level * 50) {
    remaining -= level * 50;
    level += 1;
  }
  return { level, current: remaining, required: level * 50 };
}

class QuestifyView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "Questify RPG"; }
  getIcon() { return "swords"; }
  async onOpen() { this.render(); }
  async onClose() {}

  render() {
    // Use the same root/container pattern as the supplied v3.0 visualization.
    const root = this.containerEl;
    root.empty();
    root.addClass("questify-root");
    const d = this.plugin.data;
    const lvl = levelInfo(d.totalXp);

    const header = root.createDiv({ cls: "q-header" });
    header.createDiv({ cls: "q-eyebrow", text: "YOUR PERSONAL ADVENTURE" });
    header.createEl("h1", { text: "⚔ Questify" });
    header.createDiv({ cls: "q-subtitle", text: "Твой прогресс — твоя история." });

    const profile = root.createDiv({ cls: "q-panel q-profile" });
    profile.createDiv({ cls: "q-avatar", text: d.avatar || "✦" });
    const info = profile.createDiv({ cls: "q-profile-info" });
    info.createDiv({ cls: "q-player-name", text: d.username || "Путешественник" });
    info.createDiv({ cls: "q-player-class", text: "Твой личный путь" });
    profile.createDiv({ cls: "q-level", text: `УРОВЕНЬ ${lvl.level}` });

    const xpWrap = root.createDiv({ cls: "q-xp-wrap" });
    const xpLabels = xpWrap.createDiv({ cls: "q-xp-labels" });
    xpLabels.createSpan({ text: `${lvl.current} / ${lvl.required} XP` });
    xpLabels.createSpan({ text: `${lvl.required - lvl.current} XP до следующего уровня` });
    const xpBar = xpWrap.createDiv({ cls: "q-progress" });
    xpBar.createDiv({ cls: "q-progress-fill" }).style.width =
      `${Math.min(100, (lvl.current / lvl.required) * 100)}%`;

    const completedCount = d.quests.filter(q => q.completed).length;
    const activeCount = d.quests.filter(q => !q.completed).length;
    const stats = root.createDiv({ cls: "q-stats" });
    this.statCard(stats, "Завершено", String(completedCount), "check-circle-2");
    this.statCard(stats, "Активно", String(activeCount), "scroll");
    this.statCard(stats, "Всего XP", String(d.totalXp), "sparkles");

    const actions = root.createDiv({ cls: "q-actions" });
    const add = actions.createEl("button", { text: "+ Новый квест", cls: "q-button q-primary" });
    add.addEventListener("click", () => new QuestModal(this.app, this.plugin).open());
    const history = actions.createEl("button", { text: "История", cls: "q-button q-secondary" });
    history.addEventListener("click", () => new CompletedHistoryModal(this.app, this.plugin).open());
    const profileButton = actions.createEl("button", { text: "Профиль", cls: "q-button q-secondary" });
    profileButton.addEventListener("click", () => new ProfileModal(this.app, this.plugin).open());

    this.sectionTitle(root, "Текущие квесты", "scroll");
    const activeList = root.createDiv({ cls: "q-quest-list" });
    const active = d.quests.filter(q => !q.completed);
    if (!active.length) {
      activeList.createDiv({ cls: "q-empty", text: "Пока нет активных квестов. Создай первый или выбери задание из библиотеки." });
    } else {
      active.forEach(q => this.renderQuest(activeList, q));
    }

    this.sectionTitle(root, "Выполненные квесты", "check-circle-2");
    const doneList = root.createDiv({ cls: "q-quest-list" });
    const completed = d.quests.filter(q => q.completed);
    if (!completed.length) {
      doneList.createDiv({ cls: "q-empty", text: "Здесь появятся твои завершённые квесты." });
    } else {
      completed.forEach(q => this.renderQuest(doneList, q));
    }

    const achievementHeading = root.createDiv({ cls: "q-section-title" });
    achievementHeading.createSpan({ text: "🏆" });
    achievementHeading.createSpan({ text: "Достижения" });
    const addAchievement = root.createEl("button", {
      text: "+ Добавить достижение",
      cls: "q-button q-secondary q-achievement-add"
    });
    addAchievement.addEventListener("click", () => new AchievementModal(this.app, this.plugin).open());

    const achievements = root.createDiv({ cls: "q-achievements" });
    if (!d.achievements.length) {
      achievements.createDiv({ cls: "q-empty", text: "Создай собственные достижения и отмечай их получение." });
    } else {
      d.achievements.forEach(a => this.renderAchievement(achievements, a));
    }

    root.createDiv({ cls: "q-footer", text: "Прогресс сохраняется локально в Obsidian." });
  }

  statCard(parent, label, value, iconName) {
    const card = parent.createDiv({ cls: "q-stat-card" });
    card.createDiv({ cls: "q-stat-icon", text: iconName === "check-circle-2" ? "✓" : iconName === "scroll" ? "▤" : "✦" });
    card.createDiv({ cls: "q-stat-value", text: value });
    card.createDiv({ cls: "q-stat-label", text: label });
  }

  sectionTitle(parent, title, icon) {
    const el = parent.createDiv({ cls: "q-section-title" });
    el.createSpan({ text: icon === "scroll" ? "▤" : "✓" });
    el.createSpan({ text: title });
  }

  renderQuest(parent, q) {
    const card = parent.createDiv({ cls: `q-quest-card ${q.completed ? "q-done-card" : ""}` });
    const main = card.createDiv({ cls: "q-quest-main" });
    main.createDiv({ cls: "q-quest-title", text: q.title });
    main.createDiv({ cls: "q-quest-desc", text: q.description || "Без описания" });
    const meta = card.createDiv({ cls: "q-quest-meta" });
    meta.createSpan({ text: `✦ ${XP_REWARD} XP` });
    meta.createSpan({ text: q.source === "library" ? "Из библиотеки" : "Пользовательский квест" });

    const controls = card.createDiv({ cls: "q-quest-controls" });
    const complete = controls.createEl("button", {
      text: q.completed ? "Вернуть в активные" : "Выполнено ✓",
      cls: "q-button q-complete"
    });
    complete.addEventListener("click", async () => {
      if (!q.completed) {
        if (!q.rewardClaimed) {
          q.rewardClaimed = true;
          this.plugin.data.totalXp += XP_REWARD;
          new Notice(`Квест завершён: +${XP_REWARD} XP`);
        } else {
          new Notice("Квест снова отмечен выполненным; повторный XP не начисляется.");
        }
        q.completed = true;
        q.completedAt = new Date().toISOString();
      } else {
        q.completed = false;
        q.completedAt = null;
      }
      await this.plugin.saveProgress();
      this.render();
    });

    const edit = controls.createEl("button", { text: "Изменить", cls: "q-button q-secondary" });
    edit.addEventListener("click", () => new QuestModal(this.app, this.plugin, q).open());

    const remove = controls.createEl("button", { text: "Удалить", cls: "q-button q-delete" });
    remove.addEventListener("click", async () => {
      if (!confirm(`Удалить квест «${q.title}»?`)) return;
      if (q.rewardClaimed) {
        this.plugin.data.totalXp = Math.max(0, this.plugin.data.totalXp - XP_REWARD);
        new Notice(`Квест удалён: ${XP_REWARD} XP возвращено из общего опыта.`);
      }
      this.plugin.data.quests = this.plugin.data.quests.filter(x => x.id !== q.id);
      await this.plugin.saveProgress();
      this.render();
    });
  }

  renderAchievement(parent, a) {
    const item = parent.createDiv({ cls: `q-achievement ${a.achieved ? "is-unlocked" : ""}` });
    item.createDiv({ cls: "q-achievement-icon", text: a.icon || "◇" });
    const copy = item.createDiv({ cls: "q-achievement-copy" });
    copy.createDiv({ cls: "q-achievement-title", text: a.title });
    copy.createDiv({ cls: "q-achievement-desc", text: a.description || "Без описания" });
    item.createDiv({ cls: "q-achievement-state", text: a.achieved ? "ПОЛУЧЕНО" : "НЕ ПОЛУЧЕНО" });

    const controls = item.createDiv({ cls: "q-achievement-controls" });
    const toggle = controls.createEl("button", {
      text: a.achieved ? "Снять отметку" : "Получено",
      cls: "q-button q-secondary"
    });
    toggle.addEventListener("click", async () => {
      a.achieved = !a.achieved;
      await this.plugin.saveProgress();
      this.render();
    });
    const edit = controls.createEl("button", { text: "Изменить", cls: "q-button q-secondary" });
    edit.addEventListener("click", () => new AchievementModal(this.app, this.plugin, a).open());
    const remove = controls.createEl("button", { text: "Удалить", cls: "q-button q-delete" });
    remove.addEventListener("click", async () => {
      if (!confirm(`Удалить достижение «${a.title}»?`)) return;
      this.plugin.data.achievements = this.plugin.data.achievements.filter(x => x.id !== a.id);
      await this.plugin.saveProgress();
      this.render();
    });
  }
}

class QuestModal extends Modal {
  constructor(app, plugin, quest = null) {
    super(app);
    this.plugin = plugin;
    this.quest = quest;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.quest ? "Изменить квест" : "Новый квест" });
    let title = this.quest?.title || "";
    let description = this.quest?.description || "";
    new Setting(contentEl).setName("Название").addText(t =>
      t.setValue(title).setPlaceholder("Название квеста").onChange(v => title = v));
    new Setting(contentEl).setName("Описание").addTextArea(t =>
      t.setValue(description).setPlaceholder("Что нужно сделать?").onChange(v => description = v));
    new Setting(contentEl).addButton(b => b.setButtonText("Сохранить").setCta().onClick(async () => {
      if (!title.trim()) { new Notice("Введи название квеста."); return; }
      if (this.quest) {
        this.quest.title = title.trim();
        this.quest.description = description.trim();
      } else {
        this.plugin.data.quests.unshift({
          id: makeId(), title: title.trim(), description: description.trim(),
          completed: false, rewardClaimed: false, source: "custom",
          createdAt: new Date().toISOString()
        });
      }
      await this.plugin.saveProgress();
      this.plugin.refreshView();
      this.close();
      new Notice(this.quest ? "Квест обновлён." : "Квест добавлен.");
    }));
  }
  onClose() { this.contentEl.empty(); }
}

class QuestLibraryModal extends Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; this.search = ""; }
  onOpen() { this.render(); }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("q-library-modal");
    contentEl.createEl("h2", { text: "Библиотека квестов" });
    contentEl.createEl("p", { text: "Выбери идею — она добавится в твои квесты и её можно будет изменить." });
    new Setting(contentEl).setName("Поиск").addText(t =>
      t.setPlaceholder("Найти квест…").setValue(this.search).onChange(v => {
        this.search = v;
        this.renderList(list);
      }));
    const list = contentEl.createDiv({ cls: "q-library-list" });
    this.renderList(list);
  }
  renderList(list) {
    list.empty();
    const term = this.search.trim().toLowerCase();
    const matches = QUEST_LIBRARY.filter(q =>
      `${q.title} ${q.description}`.toLowerCase().includes(term));
    if (!matches.length) {
      list.createDiv({ cls: "q-empty", text: "Ничего не найдено." });
      return;
    }
    matches.forEach(template => {
      const card = list.createDiv({ cls: "q-library-item" });
      const copy = card.createDiv({ cls: "q-library-copy" });
      copy.createDiv({ cls: "q-quest-title", text: template.title });
      copy.createDiv({ cls: "q-quest-desc", text: template.description });
      const add = card.createEl("button", { text: "Добавить", cls: "q-button q-primary" });
      add.addEventListener("click", async () => {
        this.plugin.data.quests.unshift({
          id: makeId(), title: template.title, description: template.description,
          completed: false, rewardClaimed: false, source: "library",
          libraryId: template.id, createdAt: new Date().toISOString()
        });
        await this.plugin.saveProgress();
        this.plugin.refreshView();
        new Notice(`Добавлен квест: ${template.title}`);
        this.close();
      });
    });
  }
  onClose() { this.contentEl.empty(); }
}


class CompletedHistoryModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() { this.render(); }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("q-history-modal");
    contentEl.createEl("h2", { text: "История выполненных квестов" });
    contentEl.createEl("p", { text: "Здесь собраны квесты, которые ты завершил, сгруппированные по дням." });

    const completed = this.plugin.data.quests
      .filter(q => q.completed)
      .sort((a, b) => new Date(b.completedAt || b.createdAt || 0) - new Date(a.completedAt || a.createdAt || 0));

    if (!completed.length) {
      contentEl.createDiv({ cls: "q-empty", text: "Пока нет выполненных квестов. Заверши квест, и он появится здесь." });
      return;
    }

    const groups = new Map();
    completed.forEach(q => {
      const date = q.completedAt || q.createdAt || new Date().toISOString();
      const key = this.formatDate(date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    });

    for (const [date, quests] of groups) {
      const day = contentEl.createDiv({ cls: "q-history-day" });
      const heading = day.createDiv({ cls: "q-history-heading" });
      heading.createEl("strong", { text: date });
      heading.createSpan({ text: `Выполнено ${quests.length} ${this.plural(quests.length)} · ${quests.length * XP_REWARD} XP` });
      const list = day.createDiv({ cls: "q-history-list" });
      quests.forEach(q => {
        const row = list.createDiv({ cls: "q-history-item" });
        row.createSpan({ cls: "q-history-check", text: "✓" });
        const copy = row.createDiv({ cls: "q-history-copy" });
        copy.createDiv({ cls: "q-history-title", text: q.title });
        if (q.description) copy.createDiv({ cls: "q-history-desc", text: q.description });
        row.createSpan({ cls: "q-history-xp", text: `+${XP_REWARD} XP` });
      });
    }
  }
  formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Дата неизвестна";
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric"
    }).format(date);
  }
  plural(n) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "квест";
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "квеста";
    return "квестов";
  }
  onClose() { this.contentEl.empty(); }
}

class AchievementModal extends Modal {
  constructor(app, plugin, achievement = null) {
    super(app);
    this.plugin = plugin;
    this.achievement = achievement;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.achievement ? "Изменить достижение" : "Новое достижение" });
    let title = this.achievement?.title || "";
    let description = this.achievement?.description || "";
    let icon = this.achievement?.icon || "🏆";
    new Setting(contentEl).setName("Название").addText(t => t.setValue(title).onChange(v => title = v));
    new Setting(contentEl).setName("Описание").addTextArea(t => t.setValue(description).onChange(v => description = v));
    new Setting(contentEl).setName("Иконка").addText(t => t.setValue(icon).onChange(v => icon = v));
    new Setting(contentEl).addButton(b => b.setButtonText("Сохранить").setCta().onClick(async () => {
      if (!title.trim()) { new Notice("Введи название достижения."); return; }
      if (this.achievement) {
        Object.assign(this.achievement, { title: title.trim(), description: description.trim(), icon: icon.trim() || "🏆" });
      } else {
        this.plugin.data.achievements.unshift({
          id: makeId(), title: title.trim(), description: description.trim(),
          icon: icon.trim() || "🏆", achieved: false, createdAt: new Date().toISOString()
        });
      }
      await this.plugin.saveProgress();
      this.plugin.refreshView();
      this.close();
    }));
  }
  onClose() { this.contentEl.empty(); }
}

class ProfileModal extends Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Профиль пользователя" });
    let username = this.plugin.data.username || "Путешественник";
    let avatar = this.plugin.data.avatar || "✦";
    new Setting(contentEl).setName("Имя пользователя").addText(t => t.setValue(username).onChange(v => username = v));
    new Setting(contentEl).setName("Аватар (эмодзи)").addText(t => t.setValue(avatar).onChange(v => avatar = v));
    new Setting(contentEl).addButton(b => b.setButtonText("Сохранить").setCta().onClick(async () => {
      this.plugin.data.username = username.trim() || "Путешественник";
      this.plugin.data.avatar = avatar.trim() || "✦";
      await this.plugin.saveProgress();
      this.plugin.refreshView();
      this.close();
    }));
    new Setting(contentEl).addButton(b => b.setButtonText("Удалить профиль и прогресс").setWarning().onClick(async () => {
      if (!confirm("Удалить профиль, все квесты, достижения и XP?")) return;
      this.plugin.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      await this.plugin.saveProgress();
      this.plugin.refreshView();
      this.close();
      new Notice("Профиль и прогресс удалены.");
    }));
  }
  onClose() { this.contentEl.empty(); }
}

module.exports = class QuestifyRPGPlugin extends Plugin {
  async onload() {
    const loaded = await this.loadData() || {};
    const oldPlayer = loaded.player || {};
    this.data = {
      ...DEFAULT_DATA,
      ...loaded,
      username: loaded.username || oldPlayer.name || DEFAULT_DATA.username,
      avatar: loaded.avatar || DEFAULT_DATA.avatar,
      totalXp: Number(loaded.totalXp ?? oldPlayer.totalXp ?? 0),
      quests: Array.isArray(loaded.quests) ? loaded.quests.map(q => ({
        id: q.id || makeId(),
        title: q.title || "Без названия",
        description: q.description || "",
        completed: Boolean(q.completed ?? q.done),
        rewardClaimed: Boolean(q.rewardClaimed ?? q.done),
        source: q.source || "custom",
        completedAt: q.completedAt || (Boolean(q.completed ?? q.done) ? (q.createdAt || q.created || new Date().toISOString()) : null),
        createdAt: q.createdAt || q.created || new Date().toISOString()
      })) : [],
      achievements: Array.isArray(loaded.achievements)
        ? loaded.achievements.filter(a => a && typeof a === "object" && a.title).map(a => ({
            id: a.id || makeId(), title: a.title, description: a.description || a.desc || "",
            icon: a.icon || "🏆", achieved: Boolean(a.achieved)
          }))
        : []
    };
    // Old v3 stored unlocked achievement IDs. Those were class-era automatic badges;
    // the new system intentionally starts with user-editable achievement cards.
    this.registerView(VIEW_TYPE, leaf => new QuestifyView(leaf, this));
    this.addRibbonIcon("swords", "Открыть Questify RPG", () => this.activateView());
    this.addCommand({
      id: "open-dashboard",
      name: "Открыть панель Questify RPG",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "add-quest",
      name: "Создать новый квест",
      callback: () => new QuestModal(this.app, this).open()
    });
    await this.saveProgress();
    this.activateView();
  }

  onunload() { this.app.workspace.detachLeavesOfType(VIEW_TYPE); }

  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  refreshView() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach(leaf => {
      if (leaf.view instanceof QuestifyView) leaf.view.render();
    });
  }

  async saveProgress() {
    await this.saveData(this.data);
  }
};
