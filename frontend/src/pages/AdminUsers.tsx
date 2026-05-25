import React, { useState, useMemo } from 'react';
import styles from './AdminUsers.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole   = 'Admin' | 'Manager' | 'Member' | 'Viewer';
type UserStatus = 'active' | 'invited' | 'suspended';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  avatarColor: string;
  initials: string;
}

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  time: string;
  dotColor: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_USERS: AppUser[] = [
  { id: 'u1', name: 'Nguyen T. Linh',   email: 'linh@fpt.com',    role: 'Admin',   status: 'active',    lastActive: 'Now',            avatarColor: '#F26522', initials: 'NL' },
  { id: 'u2', name: 'Tran Nguyen Trung',email: 'trung@fpt.com',   role: 'Manager', status: 'active',    lastActive: '1 hour ago',     avatarColor: '#3B82F6', initials: 'TT' },
  { id: 'u3', name: 'Le Bao Minh',      email: 'minh@fpt.com',    role: 'Member',  status: 'active',    lastActive: 'Yesterday',      avatarColor: '#10B981', initials: 'LM' },
  { id: 'u4', name: 'Pham Thi Hoa',     email: 'hoa@fpt.com',     role: 'Member',  status: 'active',    lastActive: '2 days ago',     avatarColor: '#8B5CF6', initials: 'PH' },
  { id: 'u5', name: 'Vo Duc Khoa',      email: 'khoa@fpt.com',    role: 'Viewer',  status: 'invited',   lastActive: 'Invite pending', avatarColor: '#F59E0B', initials: 'VK' },
  { id: 'u6', name: 'Dang Thi Mai',     email: 'mai@fpt.com',     role: 'Member',  status: 'suspended', lastActive: '2 weeks ago',    avatarColor: '#6366F1', initials: 'DM' },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', actor: 'Nguyen T. Linh',    action: 'invited Vo Duc Khoa as Viewer',          time: '10 min ago',  dotColor: '#F26522' },
  { id: 'a2', actor: 'Tran Nguyen Trung', action: 'changed Le Bao Minh\'s role to Member',  time: '2 hours ago', dotColor: '#3B82F6' },
  { id: 'a3', actor: 'Nguyen T. Linh',    action: 'suspended Dang Thi Mai',                 time: 'Yesterday',   dotColor: '#EF4444' },
  { id: 'a4', actor: 'Tran Nguyen Trung', action: 'added Pham Thi Hoa as Member',           time: '3 days ago',  dotColor: '#10B981' },
  { id: 'a5', actor: 'Nguyen T. Linh',    action: 'promoted Tran Nguyen Trung to Manager',  time: '1 week ago',  dotColor: '#F26522' },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  Admin:   { bg: 'rgba(242,101,34,0.12)',  color: '#F26522' },
  Manager: { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
  Member:  { bg: 'rgba(16,185,129,0.12)',  color: '#10B981' },
  Viewer:  { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' },
};

const STATUS_STYLE: Record<UserStatus, { dot: string; label: string }> = {
  active:    { dot: '#10B981', label: 'Active'    },
  invited:   { dot: '#F59E0B', label: 'Invited'   },
  suspended: { dot: '#EF4444', label: 'Suspended' },
};

// ─── Modal state types ────────────────────────────────────────────────────────

type ModalState =
  | { type: 'invite'; name: string; email: string; role: UserRole }
  | { type: 'edit';   userId: string; role: UserRole; status: UserStatus }
  | { type: 'remove'; userId: string };

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminUsers() {
  const [users, setUsers]       = useState<AppUser[]>(INITIAL_USERS);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<ModalState | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      : users;
  }, [users, search]);

  // ── Stats ──
  const activeCount    = users.filter((u) => u.status === 'active').length;
  const invitedCount   = users.filter((u) => u.status === 'invited').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;

  const roleCounts = useMemo(() => {
    const counts: Record<UserRole, number> = { Admin: 0, Manager: 0, Member: 0, Viewer: 0 };
    users.forEach((u) => { counts[u.role]++; });
    return counts;
  }, [users]);

  // ── Actions ──
  function handleInviteSubmit() {
    if (modal?.type !== 'invite') return;
    if (!modal.email.trim()) return;
    const newUser: AppUser = {
      id: `u${Date.now()}`,
      name: modal.name || modal.email.split('@')[0],
      email: modal.email,
      role: modal.role,
      status: 'invited',
      lastActive: 'Invite pending',
      avatarColor: '#6B7280',
      initials: (modal.name || modal.email).slice(0, 2).toUpperCase(),
    };
    setUsers((prev) => [...prev, newUser]);
    setModal(null);
  }

  function handleEditSubmit() {
    if (modal?.type !== 'edit') return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === modal.userId ? { ...u, role: modal.role, status: modal.status } : u,
      ),
    );
    setModal(null);
  }

  function handleRemoveConfirm() {
    if (modal?.type !== 'remove') return;
    setUsers((prev) => prev.filter((u) => u.id !== modal.userId));
    setModal(null);
  }

  function openEdit(user: AppUser) {
    setModal({ type: 'edit', userId: user.id, role: user.role, status: user.status });
  }

  const editingUser = modal?.type === 'edit' ? users.find((u) => u.id === modal.userId) : null;
  const removingUser = modal?.type === 'remove' ? users.find((u) => u.id === modal.userId) : null;

  return (
    <>
      <div className={styles.layout}>
        {/* ── Left column: user table ── */}
        <div>
          <div className={styles.colHeader}>
            <p className={styles.colTitle}>Team Members ({users.length})</p>
            <button
              className={styles.inviteBtn}
              onClick={() => setModal({ type: 'invite', name: '', email: '', role: 'Member' })}
            >
              + Invite User
            </button>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {filtered.map((user) => {
                const role   = ROLE_STYLE[user.role];
                const status = STATUS_STYLE[user.status];
                return (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: user.avatarColor }}>
                          {user.initials}
                        </div>
                        <div>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.roleBadge} style={{ background: role.bg, color: role.color }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <div className={styles.dot} style={{ background: status.dot }} />
                        {status.label}
                      </div>
                    </td>
                    <td style={{ color: '#6B7280', fontSize: 12 }}>{user.lastActive}</td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => openEdit(user)}>
                        Edit
                      </button>
                      <button
                        className={styles.removeActionBtn}
                        onClick={() => setModal({ type: 'remove', userId: user.id })}
                        disabled={user.id === 'u1'}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Right column ── */}
        <div>
          {/* Summary stats */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Team Overview</p>
            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue} style={{ color: '#10B981' }}>{activeCount}</div>
                <div className={styles.statLabel}>Active</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue} style={{ color: '#F59E0B' }}>{invitedCount}</div>
                <div className={styles.statLabel}>Invited</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue} style={{ color: '#EF4444' }}>{suspendedCount}</div>
                <div className={styles.statLabel}>Suspended</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{users.length}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
            </div>
          </div>

          {/* Role distribution */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>By Role</p>
            {(Object.keys(ROLE_STYLE) as UserRole[]).map((role) => (
              <div key={role} className={styles.roleRow}>
                <span className={styles.roleRowLabel}>
                  <span
                    className={styles.roleBadge}
                    style={{ background: ROLE_STYLE[role].bg, color: ROLE_STYLE[role].color }}
                  >
                    {role}
                  </span>
                </span>
                <span className={styles.roleRowCount}>{roleCounts[role]}</span>
              </div>
            ))}
          </div>

          {/* Audit log */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Recent Activity</p>
            <div className={styles.auditList}>
              {AUDIT_LOG.map((entry) => (
                <div key={entry.id} className={styles.auditEntry}>
                  <div className={styles.auditDot} style={{ background: entry.dotColor }} />
                  <div className={styles.auditText}>
                    <span className={styles.auditActor}>{entry.actor}</span>
                    {' '}{entry.action}{' '}
                    <span className={styles.auditTime}>· {entry.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Invite modal ── */}
      {modal?.type === 'invite' && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>Invite Team Member</p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                className={styles.formInput}
                placeholder="e.g. Nguyen Van A"
                value={modal.name}
                onChange={(e) => setModal({ ...modal, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                className={styles.formInput}
                type="email"
                placeholder="user@fpt.com"
                value={modal.email}
                onChange={(e) => setModal({ ...modal, email: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role</label>
              <select
                className={styles.formSelect}
                value={modal.role}
                onChange={(e) => setModal({ ...modal, role: e.target.value as UserRole })}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button className={styles.modalSaveBtn} onClick={handleInviteSubmit}>Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {modal?.type === 'edit' && editingUser && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>Edit — {editingUser.name}</p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role</label>
              <select
                className={styles.formSelect}
                value={modal.role}
                onChange={(e) => setModal({ ...modal, role: e.target.value as UserRole })}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formSelect}
                value={modal.status}
                onChange={(e) => setModal({ ...modal, status: e.target.value as UserStatus })}
              >
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button className={styles.modalSaveBtn} onClick={handleEditSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove confirm modal ── */}
      {modal?.type === 'remove' && removingUser && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.removeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.removeModalIcon}>👤</div>
            <p className={styles.removeModalTitle}>Remove {removingUser.name}?</p>
            <p className={styles.removeModalText}>
              This will revoke their access immediately. Their previously assigned tasks will remain.
            </p>
            <div className={styles.removeModalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button className={styles.removeConfirmBtn} onClick={handleRemoveConfirm}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminUsers;
