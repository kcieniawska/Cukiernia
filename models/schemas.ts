// Tutaj definiujemy zasady: co może trafić do bazy danych.

import { z } from "../deps.ts";

export const TaskSchema = z.object({
  name: z.string()
    .min(3, "Nazwa wypieku musi mieć co najmniej 3 znaki")
    .max(50, "Nazwa jest za długa"),
  priority: z.number().int().min(1).max(3).optional().default(2)
});