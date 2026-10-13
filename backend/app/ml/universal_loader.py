import io
import os
import zipfile
import cv2
import numpy as np
from PIL import Image, ImageOps
from typing import Optional, Tuple, List, Dict, Any

def extract_face_image_from_bytes(file_bytes: bytes, filename: Optional[str] = None) -> Tuple[np.ndarray, str]:
    """
    Universal File Ingestion Engine:
    Accepts ANY image format (JPEG, JPG, PNG, WEBP, BMP, TIFF, AVIF, GIF, ICO)
    and ANY document format (PDF, Word DOCX/DOC) and extracts the best clinical face image.
    
    Returns: (image_bgr, format_source_description)
    """
    if not file_bytes:
        raise ValueError("File bytes cannot be empty.")

    filename_lower = (filename or "").lower()
    
    # 1. Check for PDF document (%PDF signature or .pdf extension)
    if file_bytes.startswith(b"%PDF") or filename_lower.endswith(".pdf"):
        return _extract_from_pdf(file_bytes)

    # 2. Check for DOCX Word Document (ZIP signature PK\x03\x04 or .docx extension)
    if (file_bytes.startswith(b"PK\x03\x04") and (filename_lower.endswith(".docx") or filename_lower.endswith(".doc"))) or filename_lower.endswith(".docx"):
        return _extract_from_docx(file_bytes)

    # 3. Check for legacy DOC or other binary documents with embedded images
    if filename_lower.endswith(".doc"):
        doc_img = _extract_from_legacy_doc(file_bytes)
        if doc_img is not None:
            return doc_img, "Word Document (.doc) Embedded Photo"

    # 4. Standard and modern image decoders (JPEG, PNG, WEBP, BMP, TIFF, AVIF, GIF, etc.)
    return _extract_from_image(file_bytes, filename)


def _extract_from_image(file_bytes: bytes, filename: Optional[str] = None) -> Tuple[np.ndarray, str]:
    """Decodes standard and modern image formats with auto-orientation."""
    # Try Pillow first (supports JPG, PNG, WEBP, BMP, TIFF, GIF, ICO, etc.)
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
        rgb_arr = np.array(pil_img)
        img_bgr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
        format_name = pil_img.format or "Image"
        return _normalize_dimensions(img_bgr), f"{format_name} Image"
    except Exception:
        pass

    # Fallback to OpenCV native decode
    nparr = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is not None:
        return _normalize_dimensions(img_bgr), "Native Decoded Image"

    raise ValueError("Unsupported or corrupted image format. Please upload a valid image, PDF, or Word document.")


def _extract_from_pdf(pdf_bytes: bytes) -> Tuple[np.ndarray, str]:
    """Extracts face photos or renders high-definition clinical pages from PDF."""
    try:
        import pymupdf  # PyMuPDF
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Could not parse PDF document: {str(e)}")

    if len(doc) == 0:
        raise ValueError("Uploaded PDF document has no pages.")

    # 1. Search for embedded photos across PDF pages
    extracted_candidates = []
    for page_idx in range(min(5, len(doc))):
        page = doc[page_idx]
        image_list = page.get_images(full=True)
        for img_info in image_list:
            xref = img_info[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                nparr = np.frombuffer(image_bytes, np.uint8)
                candidate_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if candidate_bgr is not None and candidate_bgr.shape[0] > 100 and candidate_bgr.shape[1] > 100:
                    extracted_candidates.append(candidate_bgr)
            except Exception:
                continue

    if extracted_candidates:
        # Use largest extracted embedded photo (usually patient clinical photo)
        best_candidate = max(extracted_candidates, key=lambda img: img.shape[0] * img.shape[1])
        return _normalize_dimensions(best_candidate), "PDF Document Embedded Photo"

    # 2. If no embedded photo, render the first page in high resolution (150 DPI)
    first_page = doc[0]
    pix = first_page.get_pixmap(dpi=150)
    img_data = pix.tobytes("png")
    nparr = np.frombuffer(img_data, np.uint8)
    rendered_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if rendered_bgr is not None:
        return _normalize_dimensions(rendered_bgr), "PDF Rendered Clinical Document"

    raise ValueError("Could not extract or render images from the uploaded PDF document.")


def _extract_from_docx(docx_bytes: bytes) -> Tuple[np.ndarray, str]:
    """Extracts embedded facial images from Word DOCX archive."""
    try:
        z = zipfile.ZipFile(io.BytesIO(docx_bytes))
        media_files = [f for f in z.namelist() if f.startswith("word/media/")]
        
        candidates = []
        for media_name in media_files:
            try:
                raw_bytes = z.read(media_name)
                nparr = np.frombuffer(raw_bytes, np.uint8)
                img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img_bgr is not None and img_bgr.shape[0] > 80 and img_bgr.shape[1] > 80:
                    candidates.append(img_bgr)
            except Exception:
                continue

        if candidates:
            # Largest embedded image is typically the patient photo
            best = max(candidates, key=lambda img: img.shape[0] * img.shape[1])
            return _normalize_dimensions(best), "Word Document (.docx) Embedded Photo"
    except Exception as e:
        raise ValueError(f"Could not read Word DOCX document: {str(e)}")

    raise ValueError("No images found inside the uploaded Word document. Please ensure the document contains a patient photo.")


def _extract_from_legacy_doc(doc_bytes: bytes) -> Optional[np.ndarray]:
    """Scans binary DOC stream for JPEG or PNG image signatures."""
    # Look for JPEG header \xff\xd8\xff and trailer \xff\xd9
    start = doc_bytes.find(b"\xff\xd8\xff")
    if start != -1:
        end = doc_bytes.rfind(b"\xff\xd9")
        if end > start:
            jpeg_bytes = doc_bytes[start:end+2]
            nparr = np.frombuffer(jpeg_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None and img.shape[0] > 80:
                return _normalize_dimensions(img)

    # Look for PNG header
    png_hdr = b"\x89PNG\r\n\x1a\n"
    start_png = doc_bytes.find(png_hdr)
    if start_png != -1:
        png_trailer = b"IEND\xaeB`\x82"
        end_png = doc_bytes.find(png_trailer, start_png)
        if end_png != -1:
            png_bytes = doc_bytes[start_png:end_png+8]
            nparr = np.frombuffer(png_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None and img.shape[0] > 80:
                return _normalize_dimensions(img)

    return None


def _normalize_dimensions(img: np.ndarray, max_dim: int = 1600) -> np.ndarray:
    """Scales down oversized images to preserve memory while maintaining landmark precision."""
    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    return img
