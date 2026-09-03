'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';

import { saveMenuAction } from '@/app/admin/menu-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import type { MenuEditorInput } from '@/lib/cms/validation';
import { cn } from '@/lib/utils';

type MenuItemRow = MenuEditorInput['items'][number];

type LinkTarget = {
  id: string;
  title: string;
};

function reorderItems(
  list: MenuItemRow[],
  fromId: string,
  toId: string
): MenuItemRow[] {
  const from = list.findIndex((item) => item.clientId === fromId);
  const to = list.findIndex((item) => item.clientId === toId);
  if (from < 0 || to < 0 || from === to) return list;

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((item, index) => ({ ...item, sortOrder: index }));
}

function createItem(partial?: Partial<MenuItemRow>): MenuItemRow {
  return {
    clientId: partial?.clientId ?? crypto.randomUUID(),
    parentClientId: partial?.parentClientId ?? null,
    label: partial?.label ?? '',
    linkType: partial?.linkType ?? 'custom',
    url: partial?.url ?? '',
    contentId: partial?.contentId ?? null,
    sortOrder: partial?.sortOrder ?? 0,
    openInNewTab: partial?.openInNewTab ?? false,
  };
}

export function MenuManager({
  menuId,
  menuName,
  initialItems,
  pages,
  posts,
}: {
  menuId: string;
  menuName: string;
  initialItems: Array<{
    id: string;
    label: string;
    sortOrder: number;
    openInNewTab: boolean;
    parentId: string | null;
    url: string | null;
    contentId: string | null;
  }>;
  pages: LinkTarget[];
  posts: LinkTarget[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialRows = useMemo(
    () =>
      [...initialItems]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) =>
          createItem({
            clientId: item.id,
            parentClientId: item.parentId,
            label: item.label,
            linkType: item.contentId ? 'content' : 'custom',
            url: item.url ?? '',
            contentId: item.contentId,
            sortOrder: item.sortOrder,
            openInNewTab: item.openInNewTab,
          })
        ),
    [initialItems]
  );
  const [items, setItems] = useState(initialRows);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const contentOptions = useMemo(
    () => [
      ...pages.map((page) => ({ ...page, group: 'Pages' })),
      ...posts.map((post) => ({ ...post, group: 'Posts' })),
    ],
    [pages, posts]
  );

  function updateItem(clientId: string, patch: Partial<MenuItemRow>) {
    setItems((current) =>
      current.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item
      )
    );
  }

  function setExpanded(clientId: string, open: boolean) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (open) next.add(clientId);
      else next.delete(clientId);
      return next;
    });
  }

  function addItem() {
    const item = createItem();
    setItems((current) => [...current, item]);
    setExpandedIds((current) => new Set(current).add(item.clientId));
  }

  function itemDestination(item: MenuItemRow) {
    if (item.linkType === 'custom') {
      return item.url?.trim() || 'Custom URL';
    }

    const selected = contentOptions.find(
      (option) => option.id === item.contentId
    );
    return selected
      ? `${selected.group}: ${selected.title}`
      : 'No content selected';
  }

  function removeItem(clientId: string) {
    setItems((current) =>
      current
        .filter((item) => item.clientId !== clientId)
        .map((item) =>
          item.parentClientId === clientId
            ? { ...item, parentClientId: null }
            : item
        )
    );
  }

  function saveMenu() {
    startTransition(async () => {
      const payload: MenuEditorInput = {
        menuId,
        items: items.map((item, index) => ({
          ...item,
          sortOrder: index,
          url: item.linkType === 'custom' ? item.url : '',
          contentId: item.linkType === 'content' ? item.contentId : null,
        })),
      };

      const result = await saveMenuAction(payload);
      toast.add({
        title: result.ok ? 'Saved' : 'Unable to save menu',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between gap-4'>
        <CardTitle>{menuName}</CardTitle>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={addItem}
        >
          <Plus className='size-4' />
          Add item
        </Button>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {items.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            No menu items yet. Add links to pages, posts, or custom URLs.
          </p>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Drag the handle to reorder. Expand an item to edit it, then save the
            menu.
          </p>
        )}

        {items.map((item, index) => {
          const isOpen = expandedIds.has(item.clientId);
          const parentLabel = items.find(
            (candidate) => candidate.clientId === item.parentClientId
          )?.label;

          return (
            <Collapsible
              key={item.clientId}
              open={isOpen}
              onOpenChange={(open) => setExpanded(item.clientId, open)}
              onDragOver={(event) => {
                event.preventDefault();
                if (!draggedId || draggedId === item.clientId) return;
                setItems((current) =>
                  reorderItems(current, draggedId, item.clientId)
                );
              }}
              className={
                draggedId === item.clientId
                  ? 'rounded-xl border border-dashed opacity-60'
                  : 'rounded-xl border'
              }
            >
              <div className='flex items-center gap-2 px-3 py-2'>
                <button
                  type='button'
                  aria-label={`Drag to reorder ${item.label || `item ${index + 1}`}`}
                  className='text-muted-foreground hover:text-foreground cursor-grab touch-none rounded-md p-1 active:cursor-grabbing'
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', item.clientId);
                    setDraggedId(item.clientId);
                  }}
                  onDragEnd={() => setDraggedId(null)}
                >
                  <GripVertical className='size-4' />
                </button>
                <CollapsibleTrigger className='hover:bg-muted/60 flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left'>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground size-4 shrink-0 transition-transform',
                      !isOpen && '-rotate-90'
                    )}
                  />
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium'>
                      {item.label.trim() || `Item ${index + 1}`}
                    </span>
                    <span className='text-muted-foreground block truncate text-xs'>
                      {itemDestination(item)}
                      {parentLabel ? ` · Child of ${parentLabel}` : ''}
                    </span>
                  </span>
                </CollapsibleTrigger>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => removeItem(item.clientId)}
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>

              <CollapsibleContent className='grid gap-3 border-t px-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor={`label-${item.clientId}`}>Label</Label>
                  <Input
                    id={`label-${item.clientId}`}
                    value={item.label}
                    onChange={(event) =>
                      updateItem(item.clientId, { label: event.target.value })
                    }
                  />
                </div>

                <div className='grid gap-2 sm:grid-cols-2'>
                  <div className='grid gap-2'>
                    <Label>Link type</Label>
                    <Select
                      value={item.linkType}
                      onValueChange={(value) =>
                        updateItem(item.clientId, {
                          linkType: value as MenuItemRow['linkType'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='custom'>Custom URL</SelectItem>
                        <SelectItem value='content'>Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-2'>
                    <Label>Parent item</Label>
                    <Select
                      value={item.parentClientId ?? 'none'}
                      onValueChange={(value) =>
                        updateItem(item.clientId, {
                          parentClientId: value === 'none' ? null : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>No parent</SelectItem>
                        {items
                          .filter(
                            (candidate) => candidate.clientId !== item.clientId
                          )
                          .map((candidate) => (
                            <SelectItem
                              key={candidate.clientId}
                              value={candidate.clientId}
                            >
                              {candidate.label || 'Untitled item'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {item.linkType === 'custom' ? (
                  <div className='grid gap-2'>
                    <Label htmlFor={`url-${item.clientId}`}>URL</Label>
                    <Input
                      id={`url-${item.clientId}`}
                      value={item.url ?? ''}
                      placeholder='/about or https://example.com'
                      onChange={(event) =>
                        updateItem(item.clientId, { url: event.target.value })
                      }
                    />
                  </div>
                ) : (
                  <div className='grid gap-2'>
                    <Label>Content</Label>
                    <Select
                      value={item.contentId ?? 'none'}
                      onValueChange={(value) =>
                        updateItem(item.clientId, {
                          contentId: value === 'none' ? null : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select content' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>Select content</SelectItem>
                        {contentOptions.map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.id}
                          >
                            {option.group}: {option.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <label className='flex items-center gap-2 text-sm'>
                  <Checkbox
                    checked={item.openInNewTab}
                    onCheckedChange={(checked) =>
                      updateItem(item.clientId, {
                        openInNewTab: checked === true,
                      })
                    }
                  />
                  Open in new tab
                </label>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        <div className='flex justify-end'>
          <Button
            type='button'
            disabled={isPending}
            onClick={saveMenu}
          >
            {isPending ? 'Saving…' : 'Save menu'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
