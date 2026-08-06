import os

SRC_DIR = os.path.dirname(os.path.abspath(__file__))

REPLACEMENTS = [
    # Original list
    ('bg-slate-900', 'bg-primary'),
    ('hover:bg-slate-800', 'hover:bg-primary/90'),
    ('hover:bg-slate-700', 'hover:bg-primary/90'),
    ('bg-white border border-slate-200', 'bg-card border border-border'),
    ('border-slate-200', 'border-border'),
    ('border-slate-300', 'border-border'),
    ('text-slate-900', 'text-foreground'),
    ('text-slate-500', 'text-muted-foreground'),
    ('text-slate-400', 'text-muted-foreground'),
    ('text-slate-700', 'text-foreground'),
    ('hover:bg-slate-50', 'hover:bg-muted'),
    ('hover:bg-slate-100', 'hover:bg-muted'),
    ('bg-slate-50', 'bg-muted'),
    ('bg-slate-100', 'bg-muted'),
    ('focus:ring-indigo-500', 'focus:ring-primary/20'),
    ('focus:border-indigo-500', 'focus:border-primary'),
    # Dark mode variants
    ('dark:bg-slate-950', 'dark:bg-background'),
    ('dark:bg-slate-900', 'dark:bg-background'),
    ('dark:bg-slate-800', 'dark:bg-card'),
    ('dark:border-slate-800', 'dark:border-border'),
    ('dark:border-slate-700', 'dark:border-border'),
    ('dark:text-slate-300', 'dark:text-foreground'),
    ('dark:text-slate-200', 'dark:text-foreground'),
    ('dark:text-slate-400', 'dark:text-muted-foreground'),
    ('dark:hover:bg-slate-700', 'dark:hover:bg-muted'),
    ('dark:hover:bg-slate-600', 'dark:hover:bg-muted'),
    # Skeleton / loading patterns
    ('bg-slate-200', 'bg-muted'),
    # Status colors and remaining shades
    ('bg-slate-300', 'bg-muted'),
    ('bg-slate-400', 'bg-muted'),
    ('bg-slate-600', 'bg-muted'),
    ('bg-slate-700', 'bg-muted'),
    ('bg-slate-800', 'bg-card'),
    ('bg-slate-950', 'bg-background'),
    ('text-slate-600', 'text-foreground'),
    ('text-slate-200', 'text-foreground'),
    ('hover:bg-slate-200', 'hover:bg-muted'),
    ('border-slate-800', 'border-border'),
    # All remaining border-slate shades
    ('border-slate-100', 'border-border'),
    ('border-slate-400', 'border-border'),
    ('border-slate-500', 'border-border'),
    ('border-slate-600', 'border-border'),
    ('border-slate-700', 'border-border'),
    ('border-slate-900', 'border-border'),
    ('border-slate-50', 'border-border'),
    # All remaining text-slate shades
    ('text-slate-300', 'text-foreground'),
    ('text-slate-800', 'text-foreground'),
    ('text-slate-950', 'text-foreground'),
    # Placeholder patterns
    ('placeholder-slate-400', 'placeholder-muted-foreground'),
    ('dark:placeholder-slate-400', 'dark:placeholder-muted-foreground'),
    # Indigo focus overrides
    ('peer-focus:ring-indigo-300', 'peer-focus:ring-primary/20'),
    ('peer-focus:ring-indigo-500', 'peer-focus:ring-primary/20'),
]

EXCLUDES = {'node_modules', '.next'}

files_modified = 0

for root, dirs, files in os.walk(SRC_DIR):
    dirs[:] = [d for d in dirs if d not in EXCLUDES]
    for fname in files:
        if not fname.endswith(('.tsx', '.ts')):
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except Exception:
            continue
        new_content = content
        for old, new in REPLACEMENTS:
            new_content = new_content.replace(old, new)
        if new_content != content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            rel = os.path.relpath(fpath, SRC_DIR)
            print(f"Fixed: {rel}")
            files_modified += 1

print(f"\nTotal files modified: {files_modified}")
