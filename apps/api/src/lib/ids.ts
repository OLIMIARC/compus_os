import { customAlphabet } from 'nanoid';

// Custom alphabet without confusing characters
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz';
const nanoid = customAlphabet(alphabet, 12);

export type IDPrefix =
    | 'usr' // User
    | 'cmp' // Campus
    | 'crs' // Course
    | 'ce'  // ContentEmbed
    | 'cu'  // CampusUpdate
    | 'nte' // Note
    | 'nf'  // NoteFile
    | 'np'  // NotePurchase
    | 'nr'  // NoteReview
    | 'fp'  // FeedPost
    | 'fc'  // FeedComment
    | 'fr'  // FeedReaction
    | 'frp' // FeedRepost
    | 'pl'  // Poll
    | 'po'  // PollOption  
    | 'pv'  // PollVote
    | 'art' // Article
    | 'ar'  // ArticleRead
    | 'tt'  // TimetableEntry
    | 'rpt' // Report
    | 'ma'; // ModerationAction

export function generateId(prefix: IDPrefix): string {
    return `${prefix}_${nanoid()}`;
}

// Helper functions for specific types
export const generateUserId = () => generateId('usr');
export const generateCampusId = () => generateId('cmp');
export const generateCourseId = () => generateId('crs');
export const generateNoteId = () => generateId('nte');
export const generatePostId = () => generateId('fp');
export const generateArticleId = () => generateId('art');
export const generatePollId = () => generateId('pl');
export const generateReportId = () => generateId('rpt');
export const generateUpdateId = () => generateId('cu');
