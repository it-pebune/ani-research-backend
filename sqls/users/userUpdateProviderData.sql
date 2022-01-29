IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'userUpdateProviderData')
	BEGIN
  DROP  Procedure  userUpdateProviderData
END
GO

CREATE PROCEDURE [dbo].userUpdateProviderData(
  @id					      INT,
  @email            VARCHAR(50),
  @profileImageUrl  VARCHAR(512),
  @providerData     VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[User]
	SET	email = @email,
      profileImageUrl = @profileImageUrl,
			providerData = @providerData
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].userUpdateProviderData TO rpb_role
GO