import { create } from "zustand";
import {
  challengeRepo,
  ChallengeDefinition,
  UserChallenge,
  ChallengeTag,
} from "./challenge.repo";

import {
  canAssignChallenge,
  validateChallengeTags,
  canDeleteTag,
  enrichChallenges,
  getDefinitionsWithTags,
  DeleteTagError,
} from "./challenge.service";

import { awardXp } from "../gamification/gamification.service";

type ChallengeState = {
  active: any[];
  definitions: ChallengeDefinition[];
  tags: ChallengeTag[];

  load: () => void;

  assign: (definition: ChallengeDefinition) => void;
  complete: (id: number) => void;
  discard: (id: number) => void;

  upsertDefinition: (data: ChallengeDefinition, tagIds: number[]) => void;
  deleteDefinition: (id: number) => void;

  createTag: (name: string, color: string) => void;
  updateTag: (id: number, name: string, color: string) => void;
  deleteTag: (id: number) => 
  | { ok: true }
  | { ok: false; reason: DeleteTagError };
};

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  active: [],
  definitions: [],
  tags: [],

  // ===== LOAD =====
  load: () => {
    const rawDefinitions = challengeRepo.getDefinitions();
    const definitions = getDefinitionsWithTags(rawDefinitions);

    const activeRaw = challengeRepo.getActiveChallenges();
    const tags = challengeRepo.getTags();

    const active = enrichChallenges(activeRaw, rawDefinitions);

    set({ definitions, active, tags });
  },

  // ===== ASSIGN =====
  assign: (definition) => {
    const active = challengeRepo.getActiveChallenges();

    const check = canAssignChallenge(definition, active);
    if (!check.ok) return;

    challengeRepo.assignChallenge(definition);

    get().load();
  },

  // ===== COMPLETE =====
  complete: (id) => {
    const challenge = challengeRepo.getById(id);
    if (!challenge) return;

    const def = challengeRepo.getDefinitionById(
      challenge.definition_id
    );
    if (!def) return;

    challengeRepo.completeChallenge(id);

    awardXp({
      type: "CHALLENGE_COMPLETED",
      difficulty: def.difficulty,
      period: def.type,
    });

    get().load();
  },

  // ===== DISCARD =====
  discard: (id) => {
    challengeRepo.discardChallenge(id);
    get().load();
  },

  // ===== DEFINITIONS =====
  upsertDefinition: (data, tagIds) => {
    const tags = challengeRepo.getTags().filter(t =>
      tagIds.includes(t.id!)
    );

    const validation = validateChallengeTags(tags);
    if (!validation.ok) return;

    challengeRepo.upsertDefinition(data, tagIds);

    get().load();
  },

  deleteDefinition: (id) => {
    challengeRepo.deleteDefinition(id);
    get().load();
  },

  // ===== TAGS =====
  createTag: (name, color) => {
    challengeRepo.createTag(name, color);
    get().load();
  },

  updateTag: (id, name, color) => {
    challengeRepo.updateTag(id, name, color);
    get().load();
  },

  deleteTag: (id) => {
    const tag = challengeRepo.getTagById(id);
    if (!tag) return { ok: false, reason: "not_found" };

    const check = canDeleteTag(tag);
    if (!check.ok) {
      return { ok: false, reason: check.reason! };
    }

    challengeRepo.deleteTag(id);
    get().load();

    return { ok: true };
  },
}));