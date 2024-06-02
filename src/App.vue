<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import wordList from "an-array-of-english-words";

import InputText from "primevue/inputtext";

const TIMER_SECONDS = 60;

const words = ref([]);
const currentWordIndex = ref(0);
const currentCharacterIndex = ref(0);
const isInvalidWord = ref(false);

const input = ref("");
const inputRef = ref();

const timerCount = ref(TIMER_SECONDS);
const timerStarted = ref(false);
const intervals = ref([]);

const totalCharacterCount = ref(0);
const wrongCharacterCount = ref(0);
const correctWordCount = ref(0);

onMounted(() => {
  init();
  initObserver();

  document.addEventListener("paste", disablePaste);
});

onBeforeUnmount(() => {
  document.removeEventListener("paste", disablePaste);
});

const init = () => {
  words.value = [];
  currentWordIndex.value = 0;
  currentCharacterIndex.value = 0;
  isInvalidWord.value = false;

  input.value = "";

  timerCount.value = TIMER_SECONDS;
  timerStarted.value = false;
  intervals.value.forEach((interval) => {
    clearInterval(interval);
  });
  intervals.value = [];

  totalCharacterCount.value = 0;
  wrongCharacterCount.value = 0;
  correctWordCount.value = 0;

  addWords(30);

  inputRef.value.$el.focus();
};

const initObserver = () => {
  const targetNode = document.body;

  const config = {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  };

  const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.target.classList.contains("highlighted")
      ) {
        handleClassChange();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  onBeforeUnmount(() => {
    observer.disconnect();
  });
};

const handleClassChange = () => {
  const highlightedElement = document.getElementsByClassName("highlighted")[0];
  if (highlightedElement) {
    const currentCharElementOffsetTop = highlightedElement.offsetTop;
    // 8px because margin is also included in 'offsetTop'
    if (currentCharElementOffsetTop > 8) {
      words.value = words.value.slice(currentWordIndex.value);
      currentWordIndex.value = 0;

      addWords(10)
    }
  }
};

const addWords = (count) => {
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * wordList.length);
    words.value.push(wordList[index]);
  }
}

const disablePaste = (event) => {
  event.preventDefault();
};

const handleInput = (event) => {
  const pressedKey = event.data;
  const currentWord = words.value[currentWordIndex.value];
  const currentChar = currentWord[currentCharacterIndex.value];

  if (!timerStarted.value) {
    timerStarted.value = true;

    const interval = setInterval(() => {
      if (timerCount.value > 0 && timerStarted.value) {
        timerCount.value--;
      }
    }, 1000);

    intervals.value.push(interval);
  }

  if (timerCount.value <= 0) {
    return;
  }

  if (currentWord.startsWith(input.value)) {
    isInvalidWord.value = false;
  }

  if (
    event.inputType === "deleteContentBackward" &&
    currentWord.startsWith(input.value)
  ) {
    currentCharacterIndex.value = input.value.length;
    return;
  }

  if (event.inputType !== "deleteContentBackward") {
    totalCharacterCount.value++;
  }

  if (currentChar === pressedKey && !isInvalidWord.value) {
    currentCharacterIndex.value++;
    if (currentCharacterIndex.value === currentWord.length) {
      correctWordCount.value++;
      currentWordIndex.value++;
      currentCharacterIndex.value = 0;

      input.value = "";
    }
  } else if (!currentWord.startsWith(input.value)) {
    isInvalidWord.value = true;

    if (event.inputType !== "deleteContentBackward") {
      wrongCharacterCount.value++;
    }
  }
};

const formatCounterTime = computed(() => {
  const minutes = Math.floor(timerCount.value / 60);
  const seconds = timerCount.value % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

const calculateAccuracy = computed(() => {
  const correctChars = totalCharacterCount.value - wrongCharacterCount.value;
  return totalCharacterCount.value > 0
    ? Math.round((correctChars / totalCharacterCount.value) * 100)
    : 100;
});

const calculateWPM = computed(() => {
  const minutesElapsed = (TIMER_SECONDS - timerCount.value) / 60;
  return minutesElapsed > 0 ? Math.round((correctWordCount.value / minutesElapsed)) : 0;
});
</script>

<template>
  <header>
    <div class="flex">
      <div class="mx-auto my-14">
        <h1 class="text-center text-4xl">
          10 Fast Fingers <span class="text-red-300">extreme</span>
        </h1>
      </div>
    </div>
  </header>

  <main>
    <div class="flex p-3">
      <div class="mx-auto flex flex-col">
        <div
          class="relative mx-auto flex h-[160px] max-w-[1000px] flex-wrap gap-2 overflow-hidden break-words rounded-md bg-[#343434] p-2 text-2xl"
        >
          <div v-for="(word, wIdx) in words">
            <span
              v-for="(char, cIdx) in word"
              class="mx-[1px]"
              :class="{
                highlighted:
                  wIdx === currentWordIndex && cIdx === currentCharacterIndex,
              }"
            >
              {{ char }}
            </span>
          </div>
        </div>
        <div class="mt-4 flex h-[60px] gap-5 max-lg:flex-col">
          <div class="h-full grow self-center max-lg:w-full">
            <InputText
              v-model="input"
              @input="handleInput"
              ref="inputRef"
              class="h-full w-full bg-[#343434] text-xl text-white focus:border-red-100"
              :class="{ invalid: isInvalidWord }"
              :disabled="timerCount <= 0"
            />
          </div>
          <div
            class="self-center rounded-md bg-[#343434] p-3 text-3xl max-lg:w-full"
          >
            {{calculateWPM}} WPM
          </div>
          <div
            class="self-center rounded-md bg-[#343434] p-3 text-3xl max-lg:w-full"
          >
            {{ calculateAccuracy }} Accuracy
          </div>
          <div
            class="self-center rounded-md bg-[#343434] p-3 text-3xl max-lg:w-full"
          >
            {{ formatCounterTime }}
          </div>
          <button
            @click="init"
            class="self-center rounded-md bg-[#343434] p-3 max-lg:w-1/2"
          >
            <span class="pi pi-undo"></span>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.invalid:focus,
.invalid {
  border-color: #ff0000;
  outline: none;
}

.highlighted {
  border-width: 1px;
  background-color: #6b7280;
}
</style>
