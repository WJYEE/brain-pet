"""
스프라이트 시트(8열 x 5행, 40칸)를 개별 PNG로 잘라 저장한다.

단순 격자(grid) 절단이 아니라, 알파 채널 기반 연결 성분(connected component)
분석으로 각 칸의 실제 캐릭터 실루엣(윤곽선 포함)을 찾아 크롭한다.
캐릭터의 일부(꼬리, 소품 등)가 격자 경계를 살짝 넘어가도 잘리지 않고,
이웃 칸 캐릭터가 넘어와 섞이는 것도 방지한다.

대상:
  public/assets/statling/characters/sheets       -> characters/        (pet_NNN.png)
  public/assets/statling/characters/deco/sheets  -> characters/deco/   (accessory_NNN.png)
  public/assets/statling/eggs/sheets             -> eggs/              (egg_NNN.png)

시트 파일은 이름순으로 정렬해 처리하며, 번호는 (시트 순서 * 40 + 칸 순서)로
결정론적으로 매겨진다. 따라서 같은 시트들로 다시 실행하면 동일한 파일명을
그대로 덮어써 재크롭(overwrite)되고, 새 시트가 뒤에 추가되면 번호가 이어진다.
"""
import glob
import os
import numpy as np
from PIL import Image
from scipy import ndimage

COLS, ROWS = 8, 5
ALPHA_THRESH = 10       # 이 값보다 큰 알파를 전경(캐릭터)으로 취급
MIN_COMPONENT_AREA = 6  # 이보다 작은 조각은 노이즈로 무시
OVERLAP_RATIO = 0.5     # 성분 면적의 이 비율 이상이 해당 칸 안에 있어야 그 칸 소유로 인정
PADDING = 6             # 최종 bbox 주변 여백(px)

ASSETS_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "assets", "statling",
)

JOBS = [
    ("characters/sheets", "characters", "pet"),
    ("characters/deco/sheets", "characters/deco", "accessory"),
    ("eggs/sheets", "eggs", "egg"),
]


def cell_bbox_via_components(labels, num_labels, comp_areas, r, c, w, h):
    """nominal grid cell을 소유한 연결 성분들의 합집합 bbox를 반환."""
    gy0, gy1 = round(r * h / ROWS), round((r + 1) * h / ROWS)
    gx0, gx1 = round(c * w / COLS), round((c + 1) * w / COLS)

    region = labels[gy0:gy1, gx0:gx1]
    present = np.unique(region)
    present = present[present != 0]

    x0f = y0f = x1f = y1f = None
    for lbl in present:
        total_area = comp_areas[lbl - 1]
        if total_area < MIN_COMPONENT_AREA:
            continue
        in_region_area = np.count_nonzero(region == lbl)
        if in_region_area / total_area <= OVERLAP_RATIO:
            continue  # 대부분 이웃 칸 소유인 성분 -> 제외

        ys, xs = np.where(labels == lbl)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        x0f = x0 if x0f is None else min(x0f, x0)
        y0f = y0 if y0f is None else min(y0f, y0)
        x1f = x1 if x1f is None else max(x1f, x1)
        y1f = y1 if y1f is None else max(y1f, y1)

    if x0f is None:
        # 전경 없음(빈 칸) -> 격자 그대로 사용
        return gx0, gy0, gx1, gy1

    x0f = max(0, x0f - PADDING)
    y0f = max(0, y0f - PADDING)
    x1f = min(w, x1f + PADDING)
    y1f = min(h, y1f + PADDING)
    return x0f, y0f, x1f, y1f


def crop_sheet(path, dest_dir, prefix, start_index):
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    w, h = im.size

    mask = arr[:, :, 3] > ALPHA_THRESH
    structure = np.ones((3, 3), dtype=int)  # 8-connectivity
    labels, num_labels = ndimage.label(mask, structure=structure)
    comp_areas = ndimage.sum(mask, labels, index=np.arange(1, num_labels + 1))

    idx = start_index
    for r in range(ROWS):
        for c in range(COLS):
            x0, y0, x1, y1 = cell_bbox_via_components(labels, num_labels, comp_areas, r, c, w, h)
            cell = im.crop((x0, y0, x1, y1))
            out_name = f"{prefix}_{idx:03d}.png"
            cell.save(os.path.join(dest_dir, out_name))
            idx += 1
    return idx


def main():
    for sheets_rel, dest_rel, prefix in JOBS:
        sheets_dir = os.path.join(ASSETS_ROOT, sheets_rel)
        dest_dir = os.path.join(ASSETS_ROOT, dest_rel)
        sheet_files = sorted(glob.glob(os.path.join(sheets_dir, "*.png")))
        if not sheet_files:
            print(f"[skip] no sheets in {sheets_dir}")
            continue

        idx = 1
        print(f"[{sheets_rel}] {len(sheet_files)} sheet(s) -> {dest_rel}/{prefix}_NNN.png")
        for sheet_path in sheet_files:
            idx = crop_sheet(sheet_path, dest_dir, prefix, idx)
        print(f"  done, wrote {prefix}_001..{idx-1:03d}")


if __name__ == "__main__":
    main()
