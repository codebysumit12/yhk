import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Upload banner to Cloudinary
const uploadToCloudinary = async (file, mediaType) => {
  const options = {
    folder: 'yhk-banners',
    resource_type: mediaType === 'video' ? 'video' : 'image',
  };

  if (mediaType === 'video') {
    options.eager = [
      { width: 300, height: 300, crop: 'pad', format: 'jpg' } // Generate thumbnail
    ];
  }

  const result = await cloudinary.uploader.upload(file.path, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    thumbnailUrl: result.eager ? result.eager[0].secure_url : null,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
    duration: result.duration || null
  };
};

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const { position, isActive } = req.query;
    
    const filter = {};
    if (position) filter.position = position;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const banners = await Banner.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { title, description, position, link, linkText, displayOrder, overlayText } = req.body;

    // Determine media type
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, mediaType);

    // Parse overlayText if it's a string
    let parsedOverlayText = {};
    if (overlayText) {
      try {
        parsedOverlayText = typeof overlayText === 'string' ? JSON.parse(overlayText) : overlayText;
      } catch (e) {
        parsedOverlayText = {};
      }
    }

    // Create banner
    const banner = await Banner.create({
      title,
      description,
      mediaType,
      mediaUrl: uploadResult.url,
      cloudinaryId: uploadResult.publicId,
      thumbnailUrl: uploadResult.thumbnailUrl,
      position: position || 'hero',
      displayOrder: displayOrder || 0,
      link,
      linkText,
      overlayText: parsedOverlayText,
      dimensions: {
        width: uploadResult.width,
        height: uploadResult.height
      },
      fileSize: uploadResult.size,
      duration: uploadResult.duration,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Banner uploaded successfully',
      data: banner
    });
  } catch (error) {
    // Clean up file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // If new file uploaded, delete old from Cloudinary and upload new
    if (req.file) {
      // Delete old media from Cloudinary
      await cloudinary.uploader.destroy(banner.cloudinaryId, {
        resource_type: banner.mediaType === 'video' ? 'video' : 'image'
      });

      // Upload new media
      const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(req.file, mediaType);

      banner.mediaType = mediaType;
      banner.mediaUrl = uploadResult.url;
      banner.cloudinaryId = uploadResult.publicId;
      banner.thumbnailUrl = uploadResult.thumbnailUrl;
      banner.dimensions = {
        width: uploadResult.width,
        height: uploadResult.height
      };
      banner.fileSize = uploadResult.size;
      banner.duration = uploadResult.duration;
    }

    // Update other fields
    const { title, description, position, link, linkText, displayOrder, isActive, overlayText } = req.body;

    if (title) banner.title = title;
    if (description !== undefined) banner.description = description;
    if (position) banner.position = position;
    if (link !== undefined) banner.link = link;
    if (linkText !== undefined) banner.linkText = linkText;
    if (displayOrder !== undefined) banner.displayOrder = displayOrder;
    if (isActive !== undefined) banner.isActive = isActive;
    
    if (overlayText) {
      try {
        banner.overlayText = typeof overlayText === 'string' ? JSON.parse(overlayText) : overlayText;
      } catch (e) {
        // Keep existing overlayText if parse fails
      }
    }

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(banner.cloudinaryId, {
      resource_type: banner.mediaType === 'video' ? 'video' : 'image'
    });

    // Delete from database
    await banner.deleteOne();

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle banner active status
// @route   PATCH /api/banners/:id/toggle
// @access  Private/Admin
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}`,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};