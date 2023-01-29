import { SubjectDao } from '~daos';
import app from '~app';
import { createHash } from 'crypto';
import { ISubjectDTO, IWSMPListResponse } from '~entities';
import moment from 'moment';

/**
 * @param {ISubjectDTO} subject
 * @return {Promise<string>}
 */
export async function computeSubjectHash(subject: ISubjectDTO): Promise<string> {
  return createHash('sha1')
    .update(subject.lastName.toLowerCase() + ' ' + subject.firstName.toLowerCase())
    .update(moment(subject.dob).format('D.MM.YYYY'))
    .digest('hex');
}

/**
 * @param {string} hash
 * @throws {Error}
 */
export async function ensureSubjectWithHashNotExists(hash: string): Promise<void> {
  const subjectDao = new SubjectDao(await app.sqlPool);

  if (await subjectDao.subjectWithHashExists(hash)) {
    throw new Error(`Subject with hash "${hash}" already exists.`);
  }
}

/**
 * @param {IWSMPListResponse} scrappedSubjects
 */
export async function markAddedSubjects(scrappedSubjects: IWSMPListResponse): Promise<void> {
  const hashes: string[] = [];

  for (const scrappedSubject of scrappedSubjects.results) {
    const hash = createHash('sha1')
      .update(scrappedSubject.name.toLowerCase())
      .update(scrappedSubject.birth)
      .digest('hex');

    scrappedSubject.hash = hash;
    hashes.push(hash);
  }

  const subjectDao = new SubjectDao(await app.sqlPool);
  const subjectIdsByHashes = await subjectDao.getSubjectsWithHashes(hashes);

  for (const scrappedSubject of scrappedSubjects.results) {
    scrappedSubject.added = typeof subjectIdsByHashes[scrappedSubject.hash] !== 'undefined';
  }
}
