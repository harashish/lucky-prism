import {
  challengeRepo,
  UserChallenge,
  ChallengeDefinition,
  ChallengeTag,
} from "./challenge.repo";

export type DeleteTagError =
  | "not_found"
  | "last_tag"
  | "tag_in_use"
  | "default_tag"
  | "invalid_tag";

export const DELETE_TAG_ERROR_MESSAGES: Record<DeleteTagError, string> = {
  last_tag: "You must have at least one tag",
  tag_in_use: "Tag is used by existing challenge",
  default_tag: "Default tag cannot be deleted",
  invalid_tag: "Invalid tag",
  not_found: "Tag not found",
};

// ===== VALIDATION =====

export function canAssignChallenge(
  definition: ChallengeDefinition,
  active: UserChallenge[]
): { ok: boolean; reason?: string } {
  if (definition.type === "daily") {
    const exists = active.some(
      (c) => c.challenge_type === "daily"
    );
    if (exists) return { ok: false, reason: "daily_exists" };
  }

  if (definition.type === "weekly") {
    const exists = active.some(
      (c) => c.challenge_type === "weekly"
    );
    if (exists) return { ok: false, reason: "weekly_exists" };
  }

  return { ok: true };
}

export function validateChallengeTags(tags: ChallengeTag[]) {
  if (!tags || tags.length === 0) {
    return { ok: false, reason: "no_tags" };
  }

  return { ok: true };
}

export function canDeleteTag(tag: ChallengeTag): 
  | { ok: true }
  | { ok: false; reason: DeleteTagError } {
  if (tag.is_default) {
    return { ok: false, reason: "default_tag" };
  }

  if (!tag.id) {
    return { ok: false, reason: "invalid_tag" };
  }

  if (challengeRepo.isTagUsed(tag.id)) {
    return { ok: false, reason: "tag_in_use" };
  }

  const allTags = challengeRepo.getTags();
  if (allTags.length <= 1) {
    return { ok: false, reason: "last_tag" };
  }

  return { ok: true };
}

// ===== PROGRESS =====

export function getWeeklyProgress(
  challenge: UserChallenge
): number | null {
  if (challenge.challenge_type !== "weekly") return null;
  if (!challenge.weekly_deadline) return null;

  const start = new Date(challenge.start_date);
  const today = new Date();

  const diff =
    Math.floor(
      (today.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.max(1, Math.min(7, diff));
}

// ===== ENRICH =====

export function enrichChallenges(
  challenges: UserChallenge[],
  definitions: ChallengeDefinition[]
) {
  return challenges.map((c) => {
    const def = definitions.find(
      (d) => d.id === c.definition_id
    );

    return {
      ...c,
      definition: def,
      tags: def
        ? challengeRepo.getTagsForDefinition(def.id!)
        : [],
      progress_days: getWeeklyProgress(c),
    };
  });
}

// ===== DEFINITIONS WITH TAGS =====

export function getDefinitionsWithTags(
  definitions: ChallengeDefinition[]
) {
  return definitions.map((def) => ({
    ...def,
    tags: def.id
      ? challengeRepo.getTagsForDefinition(def.id)
      : [],
  }));
}

export function mapTagNamesToIds(
  names: string[],
  tags: ChallengeTag[]
): number[] {
  return names
    .map((name) => tags.find((t) => t.name === name)?.id)
    .filter((id): id is number => !!id);
}

export function mapTagIdsToNames(
  ids: number[],
  tags: ChallengeTag[]
): string[] {
  return tags
    .filter((t) => ids.includes(t.id!))
    .map((t) => t.name);
}