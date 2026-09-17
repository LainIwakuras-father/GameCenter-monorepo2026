import { createEffect } from "effector";

import { get } from "../../shared/lib";

import type { Stantion, StantionsOrder } from "./typings";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getStantions = createEffect(async () => {
  const [rawStantions, rawStantionsOrder] = await Promise.all([
    get("/station"),
    get("/stationorder"),
  ]);

  if (!Array.isArray(rawStantions) || !Array.isArray(rawStantionsOrder)) {
    throw new Error("Некорректный ответ станций");
  }

  const stantions: Record<Stantion["id"], Stantion> = {};
  rawStantions.forEach((value) => {
    if (!isRecord(value)) {
      throw new Error("Некорректные данные станции");
    }

    const rawStantion = value;
    const id = Number(rawStantion.id);
    const time = Number(rawStantion.time ?? 0);
    const points = Number(rawStantion.points ?? 0);
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Некорректный идентификатор станции");
    }
    if (
      !Number.isInteger(time) ||
      time < 0 ||
      !Number.isInteger(points) ||
      points < 0
    ) {
      throw new Error("Некорректные параметры станции");
    }

    stantions[id] = {
      id,
      time,
      points,
      name: String(rawStantion.name ?? ""),
      description:
        typeof rawStantion.description === "string"
          ? rawStantion.description
          : null,
      image: typeof rawStantion.image === "string" ? rawStantion.image : null,
      assignment:
        typeof rawStantion.assignment === "string"
          ? rawStantion.assignment
          : null,
    };
  });

  const stantionsOrder: StantionsOrder[] = rawStantionsOrder.map((value) => {
    if (!isRecord(value)) {
      throw new Error("Некорректные данные маршрута");
    }

    const rawOrder = value;
    const id = Number(rawOrder.id);
    const order = [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "ninth",
      "tenth",
    ]
      .map((field) => rawOrder[`${field}_id`] ?? rawOrder[field])
      .map((value) => {
        if (value == null) {
          return null;
        }

        const id = Number(value);
        if (!Number.isInteger(id) || id < 1) {
          throw new Error("Некорректный идентификатор станции в маршруте");
        }

        return id;
      });

    if (!Number.isInteger(id) || id < 1 || order.length !== 10) {
      throw new Error("Некорректный маршрут станций");
    }

    return { id, order };
  });

  return { stantions, stantionsOrder };
});
