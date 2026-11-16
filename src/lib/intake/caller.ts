/**
 * Who rings the homeowner, in homeowner-facing words (Cal's ruling, 16 Nov
 * 2026): "a member of our team", never a person's name. This is the site's
 * one caller label. It deliberately ignores the tenant setting
 * `survey.homeownerFacingName` / `welcomeCallName` (AISolar config), so no
 * name can reach the intake, the analyser, the exit quiz or the booking page
 * whatever that setting says.
 */
export const CALLER = 'a member of our team';
/** The same label at the start of a sentence. */
export const CALLER_START = 'A member of our team';
