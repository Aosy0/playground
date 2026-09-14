import type { Lesson } from './types.ts'
import { intro } from './part1-intro.ts'
import { basics } from './part2-basics.ts'
import { advanced } from './part3-advanced.ts'
import { reading } from './part4-reading.ts'

export const lessons: Lesson[] = [...intro, ...basics, ...advanced, ...reading]
