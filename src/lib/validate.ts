export function validateBook(payload: any) {
  if (!payload || typeof payload !== 'object') return 'Payload must be an object';
  if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) return 'Title is required';
  if (!payload.author || typeof payload.author !== 'string' || !payload.author.trim()) return 'Author is required';
  if (payload.isbn && typeof payload.isbn !== 'string') return 'ISBN must be a string';
  return null;
}

export function validateMember(payload: any) {
  if (!payload || typeof payload !== 'object') return 'Payload must be an object';
  if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) return 'Name is required';
  if (payload.email && typeof payload.email !== 'string') return 'Email must be a string';
  if (!payload.memberId || typeof payload.memberId !== 'string' || !payload.memberId.trim()) return 'memberId is required';
  return null;
}

export function validateLoan(payload: any) {
  if (!payload || typeof payload !== 'object') return 'Payload must be an object';
  if (!payload.bookId || typeof payload.bookId !== 'string') return 'bookId is required';
  if (!payload.memberId || typeof payload.memberId !== 'string') return 'memberId is required';
  // dueDate optional but if present must be a valid date
  if (payload.dueDate) {
    const d = new Date(payload.dueDate);
    if (isNaN(d.getTime())) return 'dueDate must be a valid date';
  }
  return null;
}
